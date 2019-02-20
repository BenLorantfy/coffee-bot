import five from 'johnny-five';
import io from 'socket.io-client';
import config from 'config';
import secrets from '../secrets';

/**
 * Relay mapping:
 * 7: Power Button
 * 6: Brew Half Cup (Left Button)
 * 5: Brew Full Cup (Right Button)
 * 4: auto-off button
 */
const board = new five.Board();
board.on('ready', function () {
  console.log('Board is ready');
  const brewButton = new five.Relay(6);
  const socket = io(config.get('url'), {
    query: { token: secrets.coffee_token },
  })
    .on('connect', () => {
      console.log('Connected to coffee server');
      listenForHeartbeat();
    })
    .on('brew', (acknowledge) => {
      console.log('Recieved brew command');
      brewButton.on();
      setTimeout(() => {
        brewButton.off();
      }, 500);

      acknowledge({ status: 'SUCCESS' });
    })
    .on('heartbeat', () => {
      console.log('Recieved heartbeat command');
      listenForHeartbeat();
    })
    .on('disconnect', () => {
      console.log('Disconnected from coffee server');
    });

  let timeout = setTimeout(function(){}, 0);
  function listenForHeartbeat() {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      console.log('Haven\'t recieved a heartbeat in 15 seconds, reconnecting');
      socket.close();
      socket.open();
    }, 15 * 1000);
  }

  if (process.env.NODE_ENV === 'development') {
    this.repl.inject({
      five,
    });
  }
});
