const config = require('./config/config');
const WebSocketServer = require('websocket').server;
const http = require('http');

const db = require('../db/db');
const shared = require('./shared/shared');
const user_signal = require('./user-handler/user-signals');

db.connect();

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

wsServer.on('request', function(request) {
    console.log('-----------------------');
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    
    let jwtToken = request.cookies.find(x => x.name === 'token');
    console.log(request.cookies);

    // TODO: jwt token check
   
    try {
        var connection = request.accept('mamall-signal-protocol', request.origin);

        shared.addUser({
            user_id: jwtToken,
            connection: connection,
            lastHeartBeat: Date.now()
        })
    }
    catch (err) {
        console.log(err);
        return;
    }

    console.log((new Date()) + ' Connection accepted.');
});

wsServer.on('connect', function(connection) {
    connection.on('message', async function(message) {
        if (message.type === 'utf8') {

            let connectedUser = shared.findUserByConnection(connection);

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
                connection.sendUTF(JSON.stringify(res));
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    })

    connection.on('close', function(reasonCode, description) {
        console.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
        shared.deleteUserByConnection(connection);
    });

})

wsServer.on('upgradeError', function(error) {
    console.log(error)
})

async function dispatchMessage(message) {

    let messageHandlers = [
        heartbeatUpdate, user_signal.callUser, user_signal.callRoom
    ];

    console.log(`Parsed type: ${message.payload.type}`);
    let result;

    if (message.payload.type != undefined) {
        result = await messageHandlers[message.payload.type](message);
    }

    console.log("result", result);
    
    return result;
}

function heartbeatUpdate(data) {
    if (!data.user_id) {
        return;
    }

    shared.updateBeatTime(data);
    console.log(shared.connectedUsers.map((item) => {item.connection = null; return item} ));


    let res = {
        type: 0,
        status: 0
    }

    return res;
}