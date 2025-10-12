const Dotenv = require('dotenv-webpack');

module.exports = (config) => {
  config.plugins.push(
    new Dotenv({
      safe: true,
      expand: true,
      silent: false,
      systemvars: true,
    }),
  );
  return config;
};
