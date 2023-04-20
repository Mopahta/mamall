const config = require('./config/config');
const WebSocketServer = require('websocket').server;
const http = require('http');
const jwt = require('jsonwebtoken');

const db = require('../db/db');
const shared = require('./shared/shared');

const mediaServer = require('../media-server/media-server');

const { jwtSecret } = require('../secret');

db.connect();
mediaServer.init();

let connectedUsers = [];

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(config.wsport, function() {
    console.log((new Date()) + ` Server is listening on port ${config.wsport}`);
});

let wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    console.log("Origin:", origin);
    if (origin !== "http://localhost:3000" && origin !== "https://mamont.sytes.net") {
        return false;
    }
    return true;
}

function validateToken(token) {
    let user = null

    if (!token) {
        return user;
    }

    try {
        user = jwt.verify(token.value, jwtSecret);

        if (user.user_id == null) {
            return null;
        }
    }
    catch (err) {
        console.error("Token expired.");
    }

    return user;
}

wsServer.on('request', function(request) {

    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    
    let jwtToken = request.cookies.find(x => x.name === 'token');

    let user = validateToken(jwtToken);

    if (user == null) {
        return request.reject();
    }

    try {
        var connection = request.accept('mamall-signal-protocol', request.origin);

        shared.addUser(connectedUsers, {
            user_id: user.user_id,
            username: user.username,
            connection: connection,
            lastHeartBeat: Date.now()
        });
    }
    catch (err) {
        console.log(err);
        return;
    }

    console.log((new Date()) + ` ${user.username} Connection accepted.`);
});

wsServer.on('connect', function(connection) {
    connection.on('message', async function(message) {
        if (message.type === 'utf8') {

            let connectedUser = shared.findUserByConnection(connectedUsers, connection);

            if (!connectedUser) {
                return;
            }

            let res;
            if (connectedUser.user_id) {
                res = await dispatchMessage({
                    user_id: connectedUser.user_id,
                    payload: JSON.parse(message.utf8Data)
                });
            }

            if (res) {
                console.log(res);
                connection.sendUTF(JSON.stringify(res));
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    })

    connection.on('close', function(reasonCode, description) {
        console.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
        connectedUsers = shared.deleteUserByConnection(connectedUsers, connection);
    });

    checkConnectionAvailability();
})

wsServer.on('upgradeError', function(error) {
    console.log(error)
})

async function dispatchMessage(message) {

    let messageHandlers = [
        heartbeatUpdate, callUser, joinRoom, callRoom, 
    ];

    let result;

    if (message.payload.type != undefined) {
        result = await messageHandlers[message.payload.type](message);
    }

    return result;
}

function heartbeatUpdate(data) {
    if (!data.user_id) {
        return;
    }

    shared.updateBeatTime(connectedUsers, data);
}

function checkConnectionAvailability() {
    connectedUsers = shared.deleteOldConnections(connectedUsers);
    setTimeout(checkConnectionAvailability, 60 * 1000);

    console.log(`${new Date()} Connections amount: ${connectedUsers.length}`);
}

async function callUser(data) {
    console.log(data);

    let res = {
        type: 2,
        status: 'failed',
        message: 'User is not available.'
    }

    let user = shared.findUserById(connectedUsers, data.payload.contact_id);

    if (user != null) {
        res.status = 'ok';
        res.message = 'User called.';

        await mediaServer.createRoom(data.payload.room_id);

        let rtpCapabilities = await mediaServer.getRtpCapabilities(data.payload.room_id);

        res.rtp = rtpCapabilities;

        let message = {
            type: 1,
            user_id: data.user_id,
            room_id: data.payload.room_id,
            rtp: rtpCapabilities
        }

        user.connection.sendUTF(JSON.stringify(message));
    }

    return res;
}

async function joinRoom(data) {
    if (data.payload.room_id == null) {
        return;
    }
    let specs = await mediaServer.joinRoom(data.payload.room_id)

    return {
        type: 3,
        specs: specs
    }
}

function callRoom(data) {

}