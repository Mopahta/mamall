const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const glob = require('bcrypt');
const fs = require('node:fs/promises');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const db = require('../db/db');
const config = require('./config/config');

const saltRounds = 10;

const user = "user";
const pass = "pass";
const passHash = "$2a$10$DscTzMhq6OBTSFDSRDg2quX.hij2x9XdpD7EBcoPmeptMXRXTwYGq";
const privateKey = "AoGALwk3aR1/Y+mnrlhrZd1Rh5jA4DwHQhrDvjS3SeCuCwqodVt8RbUL1mOhPBNr";
let tokenBlackList = [];

app = express();
db.connect();

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "../concert-front/public");
        }, 
        filename: function (req, file, cb) {
            cb(null, req.body['concert-name'] + "." + mime.extension(file.mimetype));
        }})
});

app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(cookieParser());

module.exports.db = db;

app.post("/login", upload.none(), async function(req, res) {
    console.log("post /login")

    console.log(req.body)

    let username = req.body['username']
    let password = req.body['password']

    console.log(req.body['username'])
    console.log(req.body['password'])

    let token = null

    if (username && password) {
        if (username === user) {
            console.log("debug")
            let match = await bcrypt.compare(password, passHash)

            console.log(match)
            if (match) {
                token = jwt.sign({username: username}, privateKey, {expiresIn: '2h'})
                console.log("token ", token)
            }

            if (token) {
                res.cookie('jwtToken', token, {maxAge: 2 * 60 * 60 * 1000, httpOnly: true})
                res.status(200).json({username: username})
            }
        }
    } 
    res.status(401).end()
})

app.post("/signup", upload.none(), async function(req, res) {
    console.log("post /signup")

    console.log(req.body)

    let username = req.body['username']
    let password = req.body['password']
    let email = req.body['email']

    console.log(req.body['username'])
    console.log(req.body['password'])

    let token = null

    if (username && password) {
        if (validateUsername(username) && validatePassword(password)) {
            console.log("debug")

            let status = db.createUser({
                username: username,
                password: password,
                secret_key: crypto.randomBytes(32).toString('hex'),
                email: email
            })

            if (status) {
                res.status(200).end();
            }
        }
    } 
    res.status(401).end()
})

function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
}

function validatePassword(password) {
    const regex = /^\S+$/;
    return regex.test(password) && password.length >= 8;
}

app.get("/logout", function(req, res) {
    console.log("get /logout")

    const token = req.cookies.jwtToken;
    if (!token) {
        return res.sendStatus(403);
    }

    if (token) {
        tokenBlackList.push(token)
    }

    res.clearCookie("jwtToken").status(200).end()
})

app.post("/validate", verifyToken, getTokenInfo);

function getTokenInfo(req, res) {
    // const header = req.headers['authorization']

    // const token = header.split(' ')[1]

    const token = req.cookies.jwtToken;

    res.cookie('jwtToken', token, {maxAge: 2 * 60 * 60 * 1000, httpOnly: true})

    res.status(200).json({username: req.user.username})
}

function verifyToken(req, res, next) {
    req.user = {username: null, verified: false}

    // const token = req.cookies.jwtToken;
    // if (!token) {
    //     return res.sendStatus(403);
    // }


    const header = req.headers['authorization']

    let verified = false 

    if (header) {
        const token = header.split(' ')[1]

        if (!(token in tokenBlackList)) {
            jwt.verify(token, privateKey, function (err,data) {
                if (!(err && !data)) {
                    req.user = {username: data.username, verified:true}
                    verified = true
                    console.log("token did pass")
                    next()
                }
            })
        }
    }

    if (!verified) {
        console.log("token didn't pass")
        return res.status(403).end()
    }
}

app.get("*", function(req, res) {
    res.status(404).end()
})

app.listen(8080, function () {
    console.log("Server is running on port 8080 ");
});