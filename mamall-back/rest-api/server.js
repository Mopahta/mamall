const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const db = require('../db/db');
const config = require('./config/config');

const { jwtSecret } = require('../secret');

const saltRounds = 8;

let tokenBlackList = [];

app = express();
const router = express.Router();

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

app.use(cors({origin: config.corsOrigin, credentials: true}));
app.use(cookieParser());

router.get("/contacts", verifyToken, async function (req, res) {
    console.log("get contacts");
    let contacts = await db.getUserContacts(req.user.user_id);

    contacts.forEach(element => {
        var date = new Date(element.contact_since);

        let options = {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
        element.contact_since = new Intl.DateTimeFormat("en-US", options).format(date);
    });

    res.status(200).json(contacts);
});

router.get("/contacts/invites", verifyToken, async function (req, res) {
    console.log("contacts invites");
    let contacts = await db.getPendingContacts(req.user.user_id);

    contacts.forEach(element => {
        var date = new Date(element.contact_since);

        let options = {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
        element.contact_since = new Intl.DateTimeFormat("en-US", options).format(date);
    });

    res.status(200).json(contacts);
});

router.post("/contacts", verifyToken, upload.none(), async function (req, res) {
    console.log("add contact");

    console.log(req.body);
    let username = req.body.username;

    if (username == null) {
        return res.status(404).json({message: "No username passed."});
    }

    let userInfo = await db.getUserInfoByUsername(username);

    if (!userInfo) {
        return res.status(404).json({message: "No such user."})
    }

    if (userInfo.user_id === req.user.user_id) {
        return res.status(403).json({message: "Can't add myself to contacts."})
    }

    let contacts = await db.getPendingContacts(req.user.user_id);

    let pendingExists = contacts.find(x => x.user_id === userInfo.user_id);

    let contactInfo = {
        user_id: req.user.user_id,
        contact_id: userInfo.user_id,
        room_id: null,
        contact_nickname: "",
        pending_invite: 1
    };

    if (req.body.nickname) {
        contactInfo.contact_nickname = req.body.nickname;
    }

    if (pendingExists != null) {
        contactInfo.pending_invite = 0;
        
        console.log("existing invitation");
        await db.approvePendingContact(userInfo.user_id, req.user.user_id);

        let room = await db.createRoom({name: "", room_mode_id: 1});
        contactInfo.room_id = room.room_id;

        db.addUserToRoom({
            room_id: room.room_id, user_id: req.user.user_id, 
            user_room_nickname: null, user_role_id: 1
        })

        db.addUserToRoom({
            room_id: room.room_id, user_id: userInfo.user_id, 
            user_room_nickname: null, user_role_id: 1
        })

        console.log(room.room_id);

        db.updateContactRoom({
            user_id: userInfo.user_id, contact_id: req.user.user_id, room_id: room.room_id
        });
    }
    
    let status = await db.addContact(contactInfo);

    if (status == '23505') {
        return res.status(401).json({status: "error", description: "Contact already exists"});
    }

    res.status(201).json({status: "success"}).end();
})

router.post("/room/create", verifyToken, upload.none(), async function (req, res) {
    console.log("room create");

    console.log(req.body);

    let ids = JSON.parse(req.body.ids);

    console.log(req.user);

    console.log(ids);

    // let room = db.createRoom

    res.status(200).json({status: "ok"});
})

router.get("/room", verifyToken, upload.none(), async function (req, res) {
    console.log("room join/get info");

    console.log(req.query.roomId);

    let roomId = JSON.parse(req.query.roomId);

    let userRooms = await db.getUserRooms(req.user.user_id);

    let userRoom = userRooms.find(x => x.room_id == roomId);

    if (userRoom == null) {
        return res.status(401).json({status: "error", message: "User doesn't prepend to this room."});
    }

    let room = await db.getRoomInfoById(roomId);

    res.status(200).json(room);
})

router.post("/login", upload.none(), async function(req, res) {
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

            if (userInfo == null) {
                return res.status(401).end();
            }
            console.log(userInfo.password);
            let match = await bcrypt.compare(password, userInfo.password);

            console.log(match)
            if (match) {
                token = jwt.sign({user_id: userInfo.user_id, username: username}, jwtSecret, {expiresIn: '2h'});
                refresh_token = jwt.sign({user_id: userInfo.user_id}, jwtSecret, {expiresIn: '1d'});

                console.log("token ", token);
                console.log("refresh token", refresh_token);

                db.updateUserRefreshToken(userInfo.user_id, refresh_token);
            }

            if (token) {
                res.cookie('token', token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none'});
                res.cookie('refresh_token', refresh_token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, path: "/api/v1/refresh"});
                res.status(200).json({username: username, user_id: userInfo.user_id});
            }
        }
    } 
    res.status(401).end()
})

router.post("/signup", upload.none(), async function(req, res) {
    console.log("post /signup")

    console.log(req.body)

    let username = req.body['username']
    let password = req.body['password']
    let email = req.body['email']

    if (username && password) {
        if (validateUsername(username) && validatePassword(password)) {
            bcrypt.hash(password, saltRounds, async function(err, hash) {
                if (err) {
                    console.error(err);
                    return;
                }
                let status = await db.createUser({
                    username: username,
                    password: hash,
                    email: email
                });

                if (!status) {
                    console.log(`User created: ${username} ${password} ${email}`);
                    res.status(200).json({status: "ok"});
                }
                if (status == '23505') {
                    res.status(401).json({status: "error", description: "User already exists"});
                }
            });
            console.log("singup debug");
        }
    } 
})

function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
}

function validatePassword(password) {
    const regex = /^\S+$/;
    return regex.test(password) && password.length >= 8;
}

router.get("/logout", function(req, res) {
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

router.post("/refresh", refreshToken);

async function refreshToken(req, res) {

    if (req.cookies.refresh_token === undefined) {
        console.log("no refresh token");
        return res.status(403).end();
    }

    let refresh_token = req.cookies.refresh_token;   

    let userInfo = null;

    if (refresh_token) {
        try {
            let decoded = jwt.verify(refresh_token, jwtSecret);
            if (decoded.user_id) {
                userInfo = await db.getUserRefreshTokenById(decoded.user_id);

                if (userInfo === undefined) {
                    return res.status(403).end();
                }

                if (refresh_token === userInfo.refresh_token) {

                    let token = jwt.sign({user_id: decoded.user_id, username: userInfo.username}, jwtSecret, {expiresIn: '2h'});
                    refresh_token = jwt.sign({user_id: decoded.user_id}, jwtSecret, {expiresIn: '1d'});
                    console.log("token ", token);
                    console.log("refresh token", refresh_token);

                    await db.updateUserRefreshToken(decoded.user_id, refresh_token);

                    res.cookie('token', token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none'});
                    res.cookie('refresh_token', refresh_token, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, path: "/api/v1/refresh"});
                    res.status(200).json({user_id: userInfo.user_id, username: userInfo.username});
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
}

router.post("/validate", verifyToken, getTokenInfo);

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
            jwt.verify(token, jwtSecret, function (err,data) {
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

router.get("*", function(req, res) {
    res.status(404).end()
})

app.use("/api/v1",  router);

app.listen(config.apiPort, function () {
    console.log(`Server is running on port ${config.apiPort}`);
});