const express = require('express'),
      app = express(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      User = require('./models/user'),
      passport = require('passport'),
      localStrategy = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost/auth', { useNewUrlParser: true })
.then(()=>{
    console.log('Connected to DB');
})
.catch(()=>{
    console.log('Error connecting to DB');  
});

app.use(require('express-session')({
    secret:'kela khalo',
    resave:false,
    saveUninitialized:false
}));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//===========
//Routes
//===========

//Auth routes

//Show sign up form
app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    User.register(new User({username:req.body.username}), req.body.password, function(err, user){
        if(err) {
            console.log(err);
            return res.redirect('register');
        }else{
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secret');
            });
        }
    })
});

app.get('/', function(req, res){
    res.render('home');
});

app.get('/secret', isLoggedIn, function(req, res){
    res.render('secret');
});

//login routes

//render login form
app.get('/login', function(res, res){
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect:'/secret',
    failureRedirect:'/login'
}), function(req, res){

});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) return next();
        res.redirect('/login');
}

app.listen(3000, function(){
    console.log('Server started on port 3000');
});