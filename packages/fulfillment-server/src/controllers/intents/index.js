import logger from '../../utils/logger';
import CoffeeController from '../coffee';

const deviceId = 'coffee-bot';

const intentTypes = {
  SYNC: "action.devices.SYNC",
  QUERY: "action.devices.QUERY",
  EXECUTE: "action.devices.EXECUTE"
}

const deviceTypes = {
  SWITCH: "action.devices.types.SWITCH"
}

const deviceTraits = {
  OnOff: "action.devices.traits.OnOff"
}

const executionStatuses = {
  SUCCESS: "SUCCESS",
}

class IntentsController {
  process(intent) {
    logger.info(`Processing intent: ${intent.intent}`);
    if (intent.intent === intentTypes.SYNC) {
      return {
        devices: [
          {
            id: deviceId,
            type: deviceTypes.SWITCH,
            traits: [
              deviceTraits.OnOff
            ],
            willReportState: false,
            name: {
              "defaultNames": ["My Coffee Maker"],
              "name": "Coffee Maker",
              "nicknames": ["coffee maker", "keurig", "coffee pot"]
            },
            deviceInfo: {
              manufacturer: "Lorantfy Inc",
              model: "K50",
              hwVersion: "1.0.0",
              swVersion: "1.0.0"
            }
          }
        ]
      }
    }

    if (intent.intent === intentTypes.QUERY) {
      return {
        devices: {
          [deviceId]: {
            online: true
          }
        }
      }
    }

    if (intent.intent === intentTypes.EXECUTE) {
      CoffeeController.makeCoffee();
      
      return {
        commands: [{
          "ids": [deviceId],
          "status": executionStatuses.SUCCESS,
          "states": {
            "on": true
          }
        }]
      }
    }
  }
}

export default (new IntentsController());
