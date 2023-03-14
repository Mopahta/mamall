const stun = require('stun')

const {
    STUN_ALLOCATE_REQUEST,
    STUN_ATTR_XOR_MAPPED_ADDRESS
} = stun.constants

const server = stun.createServer({type: 'udp4'})

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
})

server.on('bindingRequest', async (req, rinfo) => {
    console.log("REQUEST:")
    console.log(req)

    console.log("RINFO")
    console.log('-----');
    console.log(rinfo)

    let message = stun.createMessage(STUN_ALLOCATE_REQUEST)
    message.addAttribute(STUN_ATTR_XOR_MAPPED_ADDRESS, rinfo.address, rinfo.port)

    console.log("MESSAGE")
    console.log(message)

    server.send(message, rinfo.port, rinfo.address,
        (err) => {
        if (err) {
            console.error('Failed to send response !!')
        } 
        else {
            console.log('Response sent successfully')
        }
    })
})

server.on('bindingIndication', () => {
    console.log("bindingIndication")
})

server.on('bindingResponse', () => {
    console.log('bindingResponse')
})

server.on('bindingError', () => {
    console.log('bindingError')
});

server.listen(3478, '0.0.0.0', function() {
    console.log('STUN server started at 0.0.0.0:3478');
    console.log('-----------------------------------');
})