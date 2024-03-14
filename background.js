import { App } from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@0.0.22/lib/esm/app.js';


let url;

const app = new App();

const ringStorage = (action, type, ring) => {
  switch(action) {
    case "set":
      localStorage.setItem(type, ring);
      break;
    case "delete":
      localStorage.removeItem(type);
      break;
  }
  return localStorage.getItem(type);
}

const setRing = (ring) => {
  app.resetSounds();
  app.configureSounds({
    ring: ring
  });
}

const handleRing = (msg) => {
  const ring = msg.data;
  switch(ring) {
    case "original":
      app.resetSounds();
      ringStorage("delete", msg.type)
      break;
    default:
      const sound = `${url}sounds/${ring}`;
      ringStorage("set", msg.type, sound);
      setRing(sound);
  }
}

app.onBackgroundMessage = msg => {
  switch(msg.value) {
    case "ring":
      handleRing(msg);
      break;
   case "config":
     const ring = ringStorage(null, msg.type);
     app.sendMessageToIframe({value: 'config', type: msg.type, ring: ring});
     break;
  } 
}

app.onWebsocketMessage = message => {
  if (message.name == 'call_created') {
    if (message.data.direction == 'internal') {
      const ring = ringStorage(null, 'internal');
      setRing(ring);
    }

    if (message.data.direction == 'inbound') {
      const ring = ringStorage(null, 'external');
      setRing(ring);
    }
  }
}

(async () => {
  await app.initialize();
  const context = app.getContext();
  url = context.app.extra.baseUrl;

  const ring = ringStorage(null, "internal");
  if (ring) {
    setRing(ring);
  }
  console.log('ring background - background launched');
})();
