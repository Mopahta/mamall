var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
        else if (message.type === 'binary') {
            console.log("Received: '" + message.binaryData + "'");
        }
    });
    
    function heartBeat() {
        if (connection.connected) {
            let buf = Buffer.alloc(9)
            buf.writeUInt8(0, 0);
            buf.writeBigUInt64LE(2323n, 1);
            // var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendBytes(buf);
            console.log(buf)
            setTimeout(heartBeat, 5000);
        }
    }
    heartBeat();
});

client.connect('ws://localhost:8000/', 'mamall-signal-protocol');