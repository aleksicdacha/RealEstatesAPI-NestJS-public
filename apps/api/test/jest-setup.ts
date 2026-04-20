import { Logger } from '@nestjs/common';

// Silence all NestJS Logger output during tests
Logger.overrideLogger([]);

// Silence console.log/error/warn during tests
const noop = () => {};
global.console = {
  ...console,
  log: noop as any,
  error: noop as any,
  warn: noop as any,
  debug: noop as any,
  info: noop as any,
};
