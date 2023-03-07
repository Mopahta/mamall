const stun = require('stun')

// const server = stun.createServer((request, response) => {

// })

const server = stun.createServer({type: 'udp4'})

server.listen(3478, () => {
  console.log('STUN server started on port 3478');
});