const WebSocketServer = require('websocket').server;

const http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8000, function() {
    console.log((new Date()) + ' Server is listening on port 8000');
});

let wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    console.log(origin);
    if (origin !== "http://localhost:3000" || origin !== "https://mamont.sytes.net") {
        return false;
    }
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    
    // console.log('Protocol ', request);
    try {
        var connection = request.accept('mamall-signal-protocol', request.origin);
    }
    catch (err) {
        console.log(err);
        return;
    }
    // console.log(connection);
    console.log((new Date()) + ' Connection accepted.');
});

wsServer.on('connect', function(connection) {
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

})

wsServer.on('upgradeError', function(error) {
    console.log(error)
})
