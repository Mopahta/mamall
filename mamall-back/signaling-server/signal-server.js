const config = require('./config/config')
const WebSocketServer = require('websocket').server;

const http = require('http');

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
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    
    try {
        var connection = request.accept('mamall-signal-protocol', request.origin);
    }
    catch (err) {
        console.log(err);
        return;
    }

    console.log((new Date()) + ' Connection accepted.');
});

wsServer.on('connect', function(connection) {
    connection.on('message', async function() {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            let res = await parseUTFMessage(message.utf8Data);

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
    });

})

wsServer.on('upgradeError', function(error) {
    console.log(error)
})

async function parseUTFMessage(message) {
    let parsed = JSON.parse(message);

    let messageDispatchers = [
        login, validate, logout, getConcerts, viewConcert, 
        deleteEvent, getStatuses,
    ];

    console.log(`Parsed type: ${parsed.type}`);
    let result;

    if (parsed.type != undefined) {
        result = await messageDispatchers[parsed.type](parsed);
    }

    if (parsed.type !== 3 && parsed.type !== 6) {
        console.log("result", result);
    }
    return result;
}