const express = require('express');
const router = express.Router();

router
    .get('/', (req, res) => {
        res.render('index')
    })
    .get('/user_input', (req, res) =>{
        res.render('form')
    })
    .get('/register', (req, res) => {
        res.render('register')
    })
    .get('/login', (req, res) => {
        res.render('login')
    })


module.exports = router;