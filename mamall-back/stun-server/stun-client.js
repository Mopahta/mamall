const stun = require('stun')

stun.request('localhost:3478', (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log(res)
    const { address } = res.getXorAddress();
    console.log('your ip', address);
  }
});
