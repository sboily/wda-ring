import { App } from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@0.0.23/lib/esm/app.js';


let url;
let main_line;

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

const playRingSound = (type) => {
  const ring = ringStorage(null, type);
  setRing(ring);
  app.playIncomingCallSound();

  // Let the incoming call sound play before resetting it
  setTimeout(() => {
    setRing(null);
  }, 100);
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
      setRing(null);
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
  // FIXME check line_id in message.data.
  if (message.name == 'call_created' && message.data.is_caller == false && message.data.line_id == main_line) {
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

  const engineVersion = context.user.engineVersion
  console.log(`Engine Version: ${engineVersion}`);

  main_line = context.user.profile.lines[0].id;
  console.log(`Main Line: ${main_line}`);

  setRing(null);
  console.log('ring background - background launched');
})();
