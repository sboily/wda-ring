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
  app.configureSounds({
    ring: ring
  });
}

const playRingSound = (sound) => {
  const ring = ringStorage(null, sound);
  setRing(ring);
  //app.playIncomingCallSound();

  // Let the incoming call sound play before resetting it
  //setTimeout(() => {
  //  setRing(null);
  //}, 100);
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

app.onCallHungUp = call => {
  app.stopCurrentSound();
}

app.onWebsocketMessage = message => {
  if (message.name == 'call_created') {
    if (message.data.direction == 'internal') {
      playRingSound('internal');
    }

    if (message.data.direction == 'inbound') {
      playRingSound('external');
    }
  }
}

(async () => {
  await app.initialize();
  const context = app.getContext();
  url = context.app.extra.baseUrl;

  setRing(null);
  console.log('ring background - background launched');
})();
