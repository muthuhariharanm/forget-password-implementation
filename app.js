const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
var nodemailer = require('nodemailer');
const path = require('path');
var hbs = require('express-hbs');
const random = require('./random')
const connection = require('./db')

const app = express();

const publicPath = path.resolve(__dirname, "pages");
app.use(express.static(publicPath)); 

// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/pages'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/pages');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your@email.com',
        pass: 'your-email-pass'
    }
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: 'dfdfdlklfndsaklnf',
    resave: true,
    saveUninitialized: true
}));


app.get('/forgot', (req, res) => {
    res.sendFile(__dirname+'/forgot.html')
})

app.post('/forgot', (req, res) => {
    email = req.body.email
    console.log(email)
    let key = random.randomString()
    req.session[email] = {email:email,key:key,set:true} ;

    var mailOptions = {
        from: 'your@email.com',
        to: email,
        subject: 'Password Reset',
        text: 'Your key to reset password is : ' + key
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            //alert('error')
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect('/reset/'+email)
        }
    });
    console.log(key)
    
})

app.post('/reset/:email', (req, res) => {
    if(req.session[req.params.email].set===true){
        email = req.params.email
        key = req.body.key
        pass = req.body.pass
        if(req.session[email].key === key){
            req.session.destroy()
            connection.query(`update students set pass='${pass}' where email='${email}'`,function(error,results,fields){
                if (error) res.redirect('/forgot');
                return res.redirect('/login');
            })
        }
        else{
            res.send('Wrong key')
        }
    }
    else{
        res.send('Not authenticated')
    }
})

app.get('/reset/:email', (req, res) => {
    if(req.session[req.params.email]){
        res.render('reset.hbs',{email:req.params.email})
    }
    else{
        res.send('Not authenticated')
    }
})

app.post('/register', (req, res) => {
    email = req.body.email
    pass = req.body.pass
    connection.query(`insert into students values ( '${email}','${pass}' ) `,function(error,results,fields){
        if (error) res.render('register.hbs',{error:'Error registration'});
        return res.redirect('/login');
    })   
})

app.post('/login', (req, res) => {
    email = req.body.email
    pass = req.body.pass
    console.log(email,pass)
    connection.query(`select * from students where email='${email}' and pass='${pass}'`,function(error,results,fields){
        if (error) res.render('login.hbs',{error:'Error login'});
        if(results.length == 1){
            return res.redirect('/dashboard/'+email)
        }
        else{
            res.render('login.hbs',{error:'Error login'});
        }
    })   
})

app.get('/register', (req, res) => {
    res.render('register.hbs',{error:''})   
})

app.get('/login', (req, res) => {
    res.render('login.hbs',{error:''})   
})

app.get('/dashboard/:email', (req, res) => {
    res.render('dashboard.hbs',{email:req.params.email})   
})

app.get('/logout', (req, res) => {
    res.redirect('/login')
})

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/home.html')
})

app.listen(8080, () => { console.log('Listening on :8080') });
