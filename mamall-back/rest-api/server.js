const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const db = require('../db/db');
const config = require('./config/config');

const saltRounds = 8;

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

app.get("/contacts", verifyToken, async function (req, res) {
    console.log("contacts");
    let contacts = await db.getUserContacts(req.user.user_id);

    res.status(200).json(contacts);
});

app.post("/login", upload.none(), async function(req, res) {
    console.log("post /login")

    console.log(req.body)

    let username = req.body['username']
    let password = req.body['password']

    console.log(req.body['username'])
    console.log(req.body['password'])

    let token = null;
    let refresh_token = null;

    if (username && password) {
        if (validateUsername(username) && validatePassword(password)) {
            let userInfo = await db.getUserInfoByUsername(username);

            if (!userInfo) {
                res.status(401).end();
            }
            console.log(userInfo.password);
            let match = await bcrypt.compare(password, userInfo.password);

            console.log(match)
            if (match) {
                token = jwt.sign({user_id: userInfo.user_id, username: username}, config.jwtSecret, {expiresIn: '2h'});
                refresh_token = jwt.sign({user_id: userInfo.user_id}, config.jwtSecret, {expiresIn: '1d'});

                console.log("token ", token);
                console.log("refresh token", refresh_token);

                db.updateUserRefreshToken(userInfo.user_id, refresh_token);
            }

            if (token) {
                res.cookie('token', token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none'});
                res.cookie('refresh_token', refresh_token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, path: "/refresh"});
                res.status(200).json({username: username, user_id: userInfo.user_id});
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

    if (username && password) {
        if (validateUsername(username) && validatePassword(password)) {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if (err) {
                    console.error(err);
                    return;
                }
                let status = db.createUser({
                    username: username,
                    password: hash,
                    email: email
                });

                if (status) {
                    console.log(`User created: ${username} ${password} ${email}`);
                }
            });
            console.log("singup debug");
            res.status(200).end();
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

    const token = req.cookies.token;
    if (!token) {
        return res.sendStatus(403);
    }

    if (token) {
        tokenBlackList.push(token)
    }

    res.clearCookie("token").clearCookie("refresh_token").status(200).end()
})

app.post("/refresh", refreshToken);

async function refreshToken(req, res) {

    if (req.cookies.refresh_token === undefined) {
        console.log("no refresh token");
        return res.status(403).end();
    }

    let refresh_token = req.cookies.refresh_token;   

    let userInfo = null;

    if (refresh_token) {
        try {
            let decoded = jwt.verify(refresh_token, config.jwtSecret);
            if (decoded.user_id) {
                userInfo = await db.getUserRefreshTokenById(decoded.user_id);

                if (refresh_token === userInfo.refresh_token) {

                    let token = jwt.sign({user_id: decoded.user_id, username: userInfo.username}, config.jwtSecret, {expiresIn: '2h'});
                    refresh_token = jwt.sign({user_id: decoded.user_id}, config.jwtSecret, {expiresIn: '1d'});
                    console.log("token ", token);
                    console.log("refresh token", refresh_token);

                    await db.updateUserRefreshToken(decoded.user_id, refresh_token);

                    res.cookie('token', token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none'});
                    res.cookie('refresh_token', refresh_token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, path: "/refresh"});
                }
                else {
                    throw "Refresh tokens don't match each other.";
                }
            }
            else {
                throw "User ids don't match each other.";
            }
        }
        catch (err) {
            console.error(err);
            res.status(403).end();
        }
    }

    res.status(200).json({user_id: userInfo.user_id, username: userInfo.username});
}

app.post("/validate", verifyToken, getTokenInfo);

function getTokenInfo(req, res) {
    // const header = req.headers['authorization']

    // const token = header.split(' ')[1]

    const token = req.cookies.token;

    // res.cookie('token', token, {maxAge: 2 * 60 * 60 * 1000, httpOnly: true})
    res.cookie = req.cookie

    res.status(200).json({username: req.user.username, user_id: req.user.user_id})
}

function verifyToken(req, res, next) {
    req.user = {user_id: null, username: null}

    const token = req.cookies.token;
    if (!token) {
        return res.sendStatus(403);
    }

    let verified = false 

    if (token) {

        if (!(token in tokenBlackList)) {
            jwt.verify(token, config.jwtSecret, function (err,data) {
                if (!(err && !data)) {
                    req.user = {user_id: data.user_id, username: data.username}
                    verified = true
                    console.log("token did pass")
                    next()
                }
            })
        }
    }

    if (!verified) {
        console.log("token didn't pass")
        return res.status(401).end()
    }
}

app.get("*", function(req, res) {
    res.status(404).end()
})

app.listen(8080, function () {
    console.log("Server is running on port 8080 ");
});