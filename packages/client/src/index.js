import five from 'johnny-five';
import io from 'socket.io-client';
import config from 'config';
import secrets from '../secrets';

const board = new five.Board();
board.on('ready', () => {
  console.log('Board is ready');
  const led = new five.Led(13);
  io(config.get('url'), {
    query: { token: secrets.coffee_token },
  })
    .on('connect', () => {
      console.log('Connected to coffee server');
    })
    .on('brew', () => {
      console.log('Recieved brew command');
      led.on();
    })
    .on('disconnect', () => {
      console.log('Disconnected from coffee server');
    });
});
