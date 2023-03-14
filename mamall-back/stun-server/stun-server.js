const stun = require('stun')

// const server = stun.createServer((request, response) => {

// })

const server = stun.createServer({type: 'udp4'})

server.listen(3478, 'localhost', function() {
    console.log('STUN server started on port 3478');
})
server.on('bindingRequest', (req) => {
    let message = stun.createMessage(stun.STUN_ALLOCATE_RESPONSE)
    message.setType(stun.STUN_ALLOCATE_RESPONSE)
    console.log(message)
    message.addAttribute(server.STUN_ATTR_XOR_MAPPED_ADDRESS, '8.8.8.8', 19302)
    console.log(message)
    console.log("bindingrequest")

}).on('bindingIndication', () => {
    console.log("bindingIndication")
}).on('bindingResponse', () => {
    console.log('bindingResponse')
}).on('bindingError', () => {
    console.log('bindingError')
});