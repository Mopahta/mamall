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
    if (config.origins.includes(origin)) {
        return true;
    }
    return false;
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
                try {
                    res = await dispatchMessage({
                        user_id: connectedUser.user_id,
                        payload: JSON.parse(message.utf8Data)
                    });
                } catch (err) {
                    console.error(err);
                }
            }

            if (res) {
                connection.sendUTF(JSON.stringify(res));
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    })

    connection.on('close', function(reasonCode, description) {
        console.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
        let user = shared.findUserByConnection(connectedUsers, connection);
        if (user) {
            handleUserRoomLeave({user_id: user.user_id, payload: {}});
        }
        connectedUsers = shared.deleteUserByConnection(connectedUsers, connection);
    });

    // checkConnectionAvailability();
})

wsServer.on('upgradeError', function(error) {
    console.log(error)
})

async function dispatchMessage(message) {

    let messageHandlers = [
        heartbeatUpdate, callRoom, createMediaTransport, 
        transportConnect, getOnProduce, consumeProducer,
        resumeConsumer, handleUserRoomLeave,
    ];

    let result;

    if (message.payload.type != undefined) {
        result = await messageHandlers[message.payload.type](message);
    }

    return result;
}

// type: 0
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

// type: 1
async function callRoom(data) {
    console.log(data);

    let res = {
        type: 2,
        status: 'failed',
        message: 'User is not available.'
    }

    if (data.payload.contact_id == null) {

        let roomUsers = await db.getRoomUsers(data.payload.room_id);

        if (roomUsers.length === 0) {
            return res;
        }

        await mediaServer.createRoom(data.payload.room_id);

        let rtpCapabilities = await mediaServer.getRtpCapabilities(data.payload.room_id);

        res.status = 'ok';
        res.message = 'joined room';
        res.room_id = data.payload.room_id;
        res.rtp = rtpCapabilities;

        return res;
    }

    let user = shared.findUserById(connectedUsers, data.payload.contact_id);

    if (user != null) {
        res.status = 'ok';
        res.message = 'User called.';
        res.room_id = data.payload.room_id;

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

// type: 2
async function createMediaTransport(data) {
    if (data.payload.room_id == null) {
        return;
    }

    let sendSpecs = await mediaServer.createMediaTransport(data.payload.room_id, data.user_id);
    let recvSpecs = await mediaServer.createMediaTransport(data.payload.room_id, data.user_id);

    return {
        type: 3,
        room_id: data.payload.room_id,
        sendSpecs: sendSpecs,
        recvSpecs: recvSpecs
    }
}

// type: 3
async function transportConnect(data) {
    await mediaServer.connectTransport(
        data.payload.room_id,
        data.payload.transportId,
        data.payload.dtlsParameters
    )
}

// type: 4
async function getOnProduce(data) {
    let producerId = await mediaServer.produceTransport(
        data.payload.room_id,
        data.payload.transportId,
        data.user_id,
        data.payload.kind,
        data.payload.rtpParameters
    )

    if (producerId != null) {
        let userIds = mediaServer.getRoomActiveUsers(data.payload.room_id);

        console.log(`active users in room ${data.payload.room_id} ${userIds}`);

        let users = await db.getUsersRoomInfo(data.payload.room_id, userIds);

        let res = {
            type: 5,
            room_id: data.payload.room_id,
            users: [],
        }

        let callerInfo = users.find(user => user.user_id === data.user_id);
        
        if (callerInfo.user_room_nickname == null) {
            callerInfo.user_room_nickname = "";
        }
        users.forEach(user => {
            if (user.user_id !== data.user_id) {
                let userWS = shared.findUserById(connectedUsers, user.user_id);
                if (userWS != null) {
                    let message = {
                        type: 4,
                        room_id: data.payload.room_id,
                        producer_id: producerId,
                        new_user_id: data.user_id,
                        user: callerInfo
                    }
    
                    console.log(message);
                    userWS.connection.sendUTF(JSON.stringify(message));
                    let userProducer = mediaServer.getUserRoomProducer(data.payload.room_id, user.user_id);
    
                    if (userProducer != null) {
                        user.producer_id = userProducer.id;
                    }
                }
            }
            if (user.user_room_nickname == null) {
                user.user_room_nickname = "";
            }
        })

        res.users = users;

        return res;
    }

    return;
}

// type: 5
async function consumeProducer(data) {

    let consumer = await mediaServer.createTransportConsumer(
        data.payload.room_id, data.user_id, data.payload.new_user_id,
        data.payload.transportId, data.payload.rtpCapabilities
    )

    if (consumer != null) {
        return {
            type: 6,
            conn_user_id: data.payload.new_user_id,
            room_id: data.payload.room_id,
            consumer: consumer
        }
    }
}

// type: 6
async function resumeConsumer(data) {
    mediaServer.resumeConsumer(data.payload.room_id, data.payload.consumer_id);
}

// type: 7
async function handleUserRoomLeave(data) {
    console.log("type7 ", data);

    if (data.payload.room_id == null) {
        data.payload.room_id = mediaServer.findCurrentUserRoomId(data.user_id);
        if (data.payload.room_id == null) {
            console.log(`user ${data.user_id} room not found`);
            return;
        }
        console.log("found user room", data.payload.room_id);
    }
    
    mediaServer.deleteUserTransports(data.user_id, data.payload.room_id);

    let userIds = mediaServer.getRoomActiveUsers(data.payload.room_id);

    if (userIds.length === 0) {
        mediaServer.closeRoom(data.payload.room_id);
        return {
            type: 7,
        }
    }

    userIds = userIds.filter(x => x !== data.user_id);

    userIds.forEach(userId => {
        let user = shared.findUserById(connectedUsers, userId);
        if (user != null) {
            let message = {
                type: 8,
                room_id: data.payload.room_id,
                user_id: data.user_id,
            }

            user.connection.sendUTF(JSON.stringify(message));

            // mb clear existing consumer 
            // upd: no need in this
        }
    })

    return {
        type: 7,
    }
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}
