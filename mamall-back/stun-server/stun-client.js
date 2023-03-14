const dgram = require('node:dgram');
const stun = require('stun')

const socket = dgram.createSocket({ type: 'udp4' });
 
stun.request('localhost', {socket: socket}, (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log(res)
        const { address } = res.getXorAddress();
        console.log('your ip', address);
    }
});



socket.on('message', (message) => {
    console.log("MESSAGE SOCKet")
    const response = stun.decode(message);
    // do stuff ...
    console.log(response)
        const { address } = response.getXorAddress();
        console.log('your ip', address);
});
