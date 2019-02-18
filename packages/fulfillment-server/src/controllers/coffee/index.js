import logger from '../../utils/logger';
import socketio from 'socket.io';
import secrets from '../../../secrets';

class CoffeeController {
  coffeeSocket = null;
  heatbeatInterval = 5 * 1000;

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
        logger.info('Coffee maker connected! Starting heartbeats...');
        this.sendHeartbeat();
      });
  }

  sendHeartbeat() {
    if (this.coffeeSocket) { 
      logger.info('Sending heartbeat');
      this.coffeeSocket.emit('heartbeat');
      setTimeout(() => this.sendHeartbeat(), this.heatbeatInterval);
    } else {
      logger.error('Not sending heartbeat becase the the coffee machine hasn\'t connected yet');
    }
  }

  makeCoffee() {
    if (this.coffeeSocket) { 
      logger.info('Turning on coffee maker');
      this.coffeeSocket.emit('brew');
    } else {
      logger.error('Can\'t brew the coffee, the coffee machine hasn\'t connected yet');
    }
  }
}

export default (new CoffeeController());
