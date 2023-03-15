const dgram = require('node:dgram');
const intel = require('intel')
const stun = require('stun')

const socket = dgram.createSocket({ type: 'udp4' });
 
stun.request('localhost', {socket: socket}, (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log("STUN client: request callback")
        console.log(res)
        const { address, port } = res.getXorAddress();
        console.log('your ip', address, '\nyour port', port);
    }
});

socket.on('message', (message) => {
    console.info("STUN client: message received")
    const response = stun.decode(message);
    let xorAddress = response.getXorAddress();
    console.log('IP:', xorAddress.address, '\nPort:', xorAddress.port);
    socket.close()
});

socket.on('close', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.info("STUN client: closed")
    }
})
