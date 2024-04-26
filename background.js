import { App } from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@0.0.23/lib/esm/app.js';


let url;
let main_line;
let isRinging;
let isIncoming;

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

const isOnCall = () => {
  return localStorage.getItem("activeCalls");
}

const setRing = (ring) => {
  app.configureSounds({
    ring: ring
  });
}

app.onCallIncoming = call => {
  isIncoming = true;
  let calls = parseInt(isOnCall) || 0;
  localStorage.setItem("activeCalls", (++calls).toString());

}

app.onCallAnswered = (call) => {
  app.stopCurrentSound();
  isRinging = false;
  isIncoming = false;
}

app.onCallHungUp = call => {
  app.stopCurrentSound();
  isRinging = false;
  isIncoming = false;
  let calls = parseInt(isOnCall) || 0;
  localStorage.setItem("activeCalls", (--calls).toString());
}

const playRingSound = (type) => {
  const ring = ringStorage(null, type);
  let calls = parseInt(isOnCall) || 0;
  if (!isRinging && isIncoming && calls < 2) {
    isRinging = true;
    setRing(ring);
    console.log(`Play ringtone sound ${ring}`);
    if (!ring) {
      app.resetSounds();
    }
    app.playIncomingCallSound();
  }

  // Let the incoming call sound play before resetting it
  setTimeout(() => {
    setRing(null);
  }, 100);
}

const handleRing = (msg) => {
  const ring = msg.data;
  switch(ring) {
    case "original":
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

app.onWebsocketMessage = message => {
  // FIXME check line_id in message.data
  // FIXME when mobile and WDA are connected, it's not possible to differenciate the line answered
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

  setRing(null);
  localStorage.setItem("activeCalls", "0");
  console.log('ring background - background launched');
})();
