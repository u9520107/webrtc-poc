import './init';
import SimplePeer from 'simple-peer';

const ws = new WebSocket('ws://localhost:8080');
let peer: SimplePeer.Instance | null = null;

ws.addEventListener('open', (ev) => {
  console.log('ws connected');
  peer = new SimplePeer({
    initiator: true,
    trickle: true,
    config: {
      iceServers: [],
    },
  });

  peer.on('signal', (data) => {
    ws.send(JSON.stringify(data));
  });
  peer.on('connect', () => {
    console.log('peer connected');
  });
  peer.on('error', (err) => {
    console.error(err);
  });
});

ws.addEventListener('message', (ev) => {
  console.log('message: ', ev.data);
  const data = JSON.parse(ev.data.toString());
  peer?.signal(data);
});
