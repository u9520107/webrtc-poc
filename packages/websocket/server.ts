import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const peers = new Set<WebSocket>();

function localhostCandidate(candidate: string): boolean {
  return /.*typ host.*/.test(candidate);
}

wss.on('connection', function connection(ws) {
  console.log('ws connected');
  peers.add(ws);
  ws.on('error', console.error);
  ws.on('close', () => {
    peers.delete(ws);
  });

  ws.on('message', function message(data) {
    const stp = JSON.parse(data.toString());
    console.log(JSON.stringify(stp, null, 2));
    if (stp.type === 'candidate' && !localhostCandidate(stp.candidate.candidate)) {
      return;
    }
    peers.forEach((p) => {
      try {
        if (p !== ws) {
          p.send(data.toString());
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
});
