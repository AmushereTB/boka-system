const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysqlConnect = require('./mysqlconnect');
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const port = process.env.PORT || 5500;
const publicFolder = path.join(__dirname, './public');

let sessionStore = new MySQLStore({}, mysqlConnect.connection);

app
    .set('view engine', 'hbs')

app
    .use(morgan('short'))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(cookieParser())
    .use(session({
        key: 'user_session',
        cookie: {
            maxAge: Number(process.env.SESSION_LIFETIME),
            sameSite: true
        },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore
    }))
    .use(express.static(publicFolder))
    .use('/', require('./routes/pages'))

app.get('/session', (req, res) => {
    req.session.isAuth = true
    //console.log(req.session)
    res.send('session test page')
})

app
    .post('/user_input', (req, res) => {
        const timeID = req.body.input_cell_id;
        const lastName = req.body.inputlastname;
        const firstName = req.body.inputfistname;
        const email = req.body.inputEmail;
        const phone = req.body.inputPhone;
        const descrption = req.body.inputdescription;

        const postQuery = 'INSERT INTO userinfo VALUE (?,?,?,?,?,?)';
        mysqlConnect.connection.query(postQuery, [timeID, lastName, firstName, email, phone, descrption], (err, result, fields) => {
            if (!err) {
                console.log('USER CREATED SUCCESSFUL!!')
                res.render('feedback', {
                    message: 'Booking successed, page will return in 3 sec'
                })
            } else {
                console.log(`the error is ${err}`)
                res.send(500);
                throw err;
            }
        })//connection end here
    })//post end here
    .post('/user_register', async (req, res) => {
        const name = req.body.input_name;
        const email = req.body.input_email;
        const phoneNumber = req.body.input_phonenumber;
        const password = req.body.input_password;
        const confirmpassword = req.body.input_confirmpassword;
        const postQuery = 'INSERT INTO registerinfo VALUE (?,?,?,?)';
        //const error = new Error();
        const hashedPassword = await bcrypt.hash(password, 8);

        if (password !== confirmpassword) {
            return res.render('register', {
                message: 'password not match'
            })
        } else {
            mysqlConnect.connection.query(postQuery, [name, email, phoneNumber, hashedPassword], (err, result, fields) => {
                if (err) {
                    if (err.code == 'ER_DUP_ENTRY') {
                        return res.render('register', {
                            message: 'This email is registered'
                        })
                    } else throw err;
                } else {
                    console.log('register successful!')
                    res.render('feedback', {
                        message: 'Register successed, page will return to homepage in 3 sec'
                    })
                }

            }) //connection end
        } //else end
    })//post ending
    .post('/user_login', (req, res) => {
        try {
            const email = req.body.input_email;
            const password = req.body.input_password;
            const postQuery = 'SELECT * FROM registerinfo WHERE email = ?'

            mysqlConnect.connection.query(postQuery, [email], async (err, result, fields) => {

                if (result.length == 0 || !(await bcrypt.compare(password, result[0].password))) {
                    return res.status(401).render('login', {
                        message: ' Email or Password is incorrect, please try again.'
                    })
                };

                if (result.length > 0 && await bcrypt.compare(password, result[0].password)) {
                    res.render('profile')
                };

            })//mysqlConnect end

        } catch (error) {
            console.log('Found error: ' + error);
        }
    })

app
    .get('/get_users', (req, res) => {
        let idContainer = [];
        mysqlConnect.connection.query('SELECT * FROM userinfo', (err, result, fields) => {
            if (!err) {
                Object.keys(result).forEach(function (key) {
                    let row = result[key];
                    idContainer.push(row.timeID);
                });
            } else {
                throw err;
            };
            res.json(idContainer);
        });

    })
    .get('/get_user_id/:id', (req, res) => {
        let getUser = 'SELECT * FROM userinfo WHERE timeID = ?'
        mysqlConnect.connection.query(getUser, [req.params.id], (err, result, fields) => {
            if (!err) {
                res.send(result)
            } else {
                throw err;
            }
        })
    })
    .get('/delete/:id', (req, res) => {
        let deleteID = 'DELETE FROM userinfo WHERE timeID = ?';
        mysqlConnect.connection.query(deleteID, [req.params.id], (err, result, fields) => {
            if (err) throw err;
            res.redirect('/');
        });
    });

//localhost:5500
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});