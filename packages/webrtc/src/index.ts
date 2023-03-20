import './init';

const f1 = document.createElement('iframe');
f1.src = 'peer1.html';

const f2 = document.createElement('iframe');
f2.src = 'peer2.html';

window.addEventListener('message', (ev) => {
  let source: string | null = null;
  if (ev.source === f1.contentWindow) {
    source = 'peer1';
    f2.contentWindow?.postMessage(ev.data);
  }
  if (ev.source === f2.contentWindow) {
    source = 'peer2';
    f1.contentWindow?.postMessage(ev.data);
  }
  if (source) {
    console.log(source, 'signal', JSON.parse(ev.data));
  }
});

document.body.appendChild(f1);
document.body.appendChild(f2);
