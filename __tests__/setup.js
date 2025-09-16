// Ensure React symbol exists for JSX transformed with the classic runtime
// (useful when some files are compiled to React.createElement without explicit import)
global.React = require('react');

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  debug: jest.fn(),
  info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};
