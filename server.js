//
// Copyright 2020 DxOS
//

const debug = require('debug');
const { SignalSwarmServer } = require('@geut/discovery-swarm-webrtc/server');

const error = debug('signal:server:error');

function createServer({ io }) {
  const connections = new Set();

  const signalSwarm = new SignalSwarmServer({ io });

  signalSwarm.on('peer:leave', ({ id }) => {
    try {
      connections.forEach((connection) => {
        if (connection.includes(id.toString('hex'))) {
          connections.delete(connection);
        }
      });
    } catch (err) {
      error(err);
    }
  });

  signalSwarm.on('info', (request) => {
    try {
      const { type, channel, from, to } = request.discoveryData;

      const channelStr = channel.toString('hex');
      const connectionId = `${channelStr}:${[from.toString('hex'), to.toString('hex')].sort().join(':')}`;

      if (type === 'connection') {
        connections.add(connectionId);
      } else if (type === 'disconnection') {
        connections.delete(connectionId);
      }

      const result = Array.from(connections.values())
        .filter(connection => connection.includes(channelStr))
        .map((connection) => {
          const conn = connection.split(':');
          return [conn[1], conn[2]];
        });

      signalSwarm.getPeers(channelStr).forEach((id) => {
        const socket = signalSwarm._sockets[id];
        if (socket) {
          socket.emit('simple-signal[info]', { channel: channelStr, connections: result });
        }
      });
    } catch (err) {
      error(err);
    }
  });
}

module.exports = createServer;
