const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mysqlConnect = require('./mysqlconnect')

const app = express();
const port = process.env.PORT || 5500;

app
    .use(morgan('short'))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(express.static('./public'));

app
    .post('/user_input', (req, res) => {
        const timeID = req.body.input_cell_id;
        const lastName = req.body.inputlastname;
        const firstName = req.body.inputfistname;
        const email = req.body.inputEmail;
        const phone = req.body.inputPhone;
        const descrption = req.body.inputdescription;

        const postQuery = 'INSERT INTO userinfo VALUE (?,?,?,?,?,?)';
        mysqlConnect.connection.query(postQuery, [timeID, lastName, firstName, email, phone, descrption], (err, rows, fields) => {
                if (!err) {
                    console.log('USER CREATED SUCCESSFUL!!')
                } else {
                    console.log(`the error if ${err}`)
                    res.send(500);
                    throw err;
                }
            })
            //res.end();
        res.redirect('/');
    })

app
    .get('./public', (req, res) => {
        console.log('Responding to root server');
        res.send('Hello, this is Root');
    })
    .get('/get_users', (req, res) => {
        let idContainer = [];
        mysqlConnect.connection.query('SELECT * FROM userinfo', (err, result, fields) => {
            if (!err) {
                Object.keys(result).forEach(function(key) {
                    let row = result[key];
                    idContainer.push(row.timeID);
                });
            } else {
                throw err;
            }
            res.json(idContainer);
            //console.log(idContainer)
        })

    })

.get('/get_user_id/:id', (req, res) => {
        let getUser = 'SELECT * FROM userinfo WHERE timeID = ?'
        mysqlConnect.connection.query(getUser, [req.params.id], (err, result, fields) => {
            if (!err) {
                //res.send(result);
                res.send(result)
                    //console.log(`Result is: ${result}`);
            } else {
                throw err;
            }
        })
    })
    .get('/delete/:id', (req, res) => {
        let deleteID = 'DELETE FROM userinfo WHERE timeID = ?';
        mysqlConnect.connection.query(deleteID, [req.params.id], function(err, data) {
            if (err) throw err;
            res.redirect('/');
        });

        //res.end()
    });
// .get('/get_users', (req, res) => {
//     mysqlConnect.connection.query('SELECT * FROM userinfo', (err, result, fields) => {
//         if (!err) {
//             res.send(result);
//             console.log(rows);
//         } else {
//             throw err;
//         }
//     })
// })

//localhost:5500
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});