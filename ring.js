import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';

const ringElem = document.getElementById("ring");

app.onIframeMessage = (msg) => {
  const ring = msg.ring.split("/").pop();
  ringElem.value = ring;
}

(async() => {
  await app.initialize();
  app.sendMessageToBackground({value: 'config'});
  ring.addEventListener("change", function() {
    const ring = ringElem.value;
    app.sendMessageToBackground({value: 'ring', data: ring});
  });
})();
