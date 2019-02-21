import logger from '../../utils/logger';
import socketio from 'socket.io';
import secrets from '../../../secrets';

class CoffeeController {
  coffeeSocket = null;
  heatbeatInterval = 5 * 1000;
  heartbeatTimeout = setTimeout(() => {}, 0);

  listenForCoffeeMachine(server) {
    logger.info('Listening for websocket connection from coffee maker...');
    const io = socketio(server);
    io.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token === secrets.coffee_token){
          return next();
        }
        
        return next(new Error('Authentication error'));
      })
      .on('connection', (socket) => {
        this.coffeeSocket = socket;
        this.coffeeSocket.on('disconnect', () => {
          logger.info('Coffee maker disconnected! Stopping hearbeats.');
          this.stopHeartbeat();
        });
        logger.info('Coffee maker connected! Starting heartbeats...');
        this.sendHeartbeat();
      });
  }

  stopHeartbeat() {
    clearTimeout(this.heartbeatTimeout);
  }

  sendHeartbeat() {
    this.stopHeartbeat();
    if (this.coffeeSocket) { 
      logger.log('verbose', 'Sending heartbeat');
      this.coffeeSocket.emit('heartbeat');
      this.heartbeatTimeout = setTimeout(() => this.sendHeartbeat(), this.heatbeatInterval);
    } else {
      logger.error('Not sending heartbeat becase the the coffee machine hasn\'t connected yet');
    }
  }

  makeCoffee() {
    return new Promise((resolve, reject) => {
      if (!this.coffeeSocket) {
        logger.error('Can\'t brew the coffee, the coffee machine hasn\'t connected yet');
        return reject();
      }

      if (!this.coffeeSocket.connected) {
        logger.error('Can\'t brew the coffee, the coffee machine is disconnected');
        return reject();
      }

      logger.info('Sending coffee maker command to turn on');
      this.coffeeSocket.emit('brew', (response) => {
        if (response && response.status === "SUCCESS") {
          logger.info('Coffee maker says it turned itself on');
          return resolve();
        }

        logger.info('Coffee maker failed to turn on');
        return reject();
      });
    });
  }
}

export default (new CoffeeController());
