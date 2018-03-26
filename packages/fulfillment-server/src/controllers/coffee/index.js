import logger from '../../utils/logger';
import socketio from 'socket.io';
import secrets from '../../../secrets';

class CoffeeController {
  coffeeSocket = null;
  constructor() {
    console.log('constructorrrrr');
  }

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
        logger.info('Coffee maker connected!');
      });
  }

  makeCoffee() {
    if (this.coffeeSocket) { 
      this.coffeeSocket.emit('brew');
    } else {
      logger.error('Can\'t brew the coffee, the coffee machine hasn\'t connected yet');
    }
  }
}

export default (new CoffeeController());
