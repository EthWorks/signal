#!/usr/bin/env node

//
// Copyright 2020 DxOS.
//

const crypto = require('crypto');
const yargs = require('yargs');

const { createBroker } = require('../index.js');

yargs
  .command('$0 [topic]', 'start a signal server', {
    topic: {
      describe: 'topic to find other signal servers',
      default: '#dxos',
      type: 'string'
    },
    port: {
      alias: 'p',
      describe: 'defines a port to listening',
      default: 4000
    },
    bootstrap: {
      alias: 'b',
      describe: 'defines a list of bootstrap nodes',
      type: 'array'
    },
    repl: {
      alias: 'r',
      describe: 'start a repl console with your signal',
      type: 'boolean'
    },
    logLevel: {
      alias: 'l',
      describe: 'defines the log level',
      default: 'info',
      choices: ['debug', 'info', 'warn', 'error']
    },
    logDir: {
      describe: 'defines a log directory',
      type: 'string'
    }
  }, (argv) => {
    const topic = crypto.createHash('sha256')
      .update(argv.topic)
      .digest();

    createBroker(topic, {
      port: argv.port,
      hyperswarm: {
        bootstrap: argv.bootstrap
      },
      repl: argv.repl,
      logLevel: argv.logLevel,
      logDir: argv.logDir
    }).start();
  })
  .help()
  .parse();
