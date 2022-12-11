import SimplePeer from "simple-peer";

type Role = "server" | "client";

export class TestPeer {
  protected ws: WebSocket;
  protected peer: SimplePeer.Instance;
  constructor(protected role: Role) {
    this.ws = new WebSocket("ws://localhost:8081");
    this.ws.addEventListener("open", () => {
      this.peer = new SimplePeer({
        initiator: this.role === 'client',
        trickle: true,
        config: {
          iceServers: [],
        },
      });
      this.peer.on("signal", (data) => {
        this.ws.send(JSON.stringify(data));
      });
      this.ws.addEventListener("message", (ev) => {
        console.log(ev);
        this.peer.signal(JSON.parse(ev.data.toString()));
      });
      this.peer.on("connect", () => {
        console.log("peer connected");
        if (this.role === 'client') {
            this.ping();
        }
      });
      this.peer.on('data', (data) => {
        console.log ('received: ', data.toString());
        if (/^ping/.test(data.toString())){
            this.pong();
            setTimeout(() => this.ping(), 1000);
        }
        
      });
    });
  }
  ping() {
    this.peer?.send(`ping from ${this.role}`);
  }
  pong() {
    this.peer?.send(`pong from ${this.role}`);
  }
}
