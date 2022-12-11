import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8081,
});

const connections = new Set<WebSocket>();

wss.on("connection", (ws) => {
  connections.add(ws);


  ws.on("message", (data) => {
    console.log('message: ', data.toString());
    connections.forEach((conn) => {
        if (conn!==ws) {
            conn.send(data.toString());
        }
    });
  });
  ws.on("close", () => {
    connections.delete(ws);
  });
  ws.on('error', () => {
    connections.delete(ws);
  });
});
