import five from 'johnny-five';
import io from 'socket.io-client';
import config from 'config';
import { createLogger } from '@coffee-bot/logger';
import secrets from '../secrets';

const logger = createLogger({ projectName: 'client' });

/**
 * Relay mapping:
 * 7: Power Button
 * 6: Brew Half Cup (Left Button)
 * 5: Brew Full Cup (Right Button)
 * 4: auto-off button
 */
const board = new five.Board();
board.on('ready', function () {
  logger.info('Board is ready');
  const brewButton = new five.Relay(6);
  const socket = io(config.get('url'), {
    query: { token: secrets.coffee_token },
  })
    .on('connect', () => {
      logger.info('Connected to coffee server');
      listenForHeartbeat();
    })
    .on('brew', (acknowledge) => {
      logger.info('Recieved brew command');
      brewButton.on();
      setTimeout(() => {
        brewButton.off();
      }, 500);

      acknowledge({ status: 'SUCCESS' });
    })
    .on('heartbeat', () => {
      logger.log('verbose', 'Recieved heartbeat command');
      listenForHeartbeat();
    })
    .on('disconnect', () => {
      logger.info('Disconnected from coffee server');
    });

  let timeout = setTimeout(() => {}, 0);
  function listenForHeartbeat() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      logger.info('Haven\'t recieved a heartbeat in 45 seconds, reconnecting');
      socket.close();
      socket.open();
    }, 45 * 1000);
  }

  if (process.env.NODE_ENV === 'development') {
    this.repl.inject({
      five,
    });
  }
});
