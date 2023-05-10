const mediaServer = require('./media-server');

async function run() {
    await mediaServer.init();
    await mediaServer.createRoom(4);
    let specs = await mediaServer.createMediaTransport(4);
    await mediaServer.stop();
}

run();