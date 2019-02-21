import * as winston from 'winston';
import colors from 'colors';

const getColor = (level) => {
  if (level === 'info') return 'blue';
  if (level === 'error') return 'red';

  return 'white';
};

const plainFormat = winston.format.printf(({ level, message, timestamp }) => {
  const color = getColor(level);
  const prefix = colors[color](`[${level.toUpperCase()}]`);
  const date = colors.grey(timestamp);
  return `[${date}] ${prefix} ${message}`;
});

export const createLogger = ({ projectName } = {}) => {
  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        plainFormat,
      ),
      level: 'info',
    }),
  ];

  if (projectName) {
    transports.push({
      filename: `../../logs/${projectName}.log`,
      level: 'verbose',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    });
  }

  return winston.createLogger({
    transports,
  });
};

/**
 * @name getStackLines
 * @description Takes a stack trace string and returns an array of lines.
 * Does some other formatting, such as removing lines inside
 * node_modules and also changing the paths to relative instead
 * of absolute
 *
 * @param {*} stack The error stack
 */
export const getStackLines = (stack) => {
  const lines = [];
  const projectDir = __dirname.replace(/coffee-bot.+$/, '');
  stack.split('\n').forEach((line, i) => {
    if (i === 0) {
      lines.push(colors.red('== Stack Trace =='));
      return;
    }

    const newLine = line
      .replace(projectDir, '')
      .replace('coffee-bot/packages/', '');

    const isInsideNodeModule = newLine.indexOf('node_modules') !== -1;
    const isInsideBaseError = i === 1 && newLine.indexOf('.BaseError') !== -1;
    if (!isInsideNodeModule && !isInsideBaseError) {
      lines.push(newLine);
    }
  });

  return lines;
};
