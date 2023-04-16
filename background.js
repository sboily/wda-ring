import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';

let count = 0;

const ringStorage = (action, ring) => {
  switch(action) {
    case "set":
      localStorage.setItem("ring", ring);
      break;
    case "delete":
      localStorage.removeItem("ring");
      break;
  }
  return localStorage.getItem("ring");
}

const playSound = () => {
  count += 1;
  app.playIncomingCallSound();
  setTimeout(() => {
    app.stopCurrentSound();

    if (count < 2) {
      playSound();
    }
  }, 1000);
}

const setRing = (ring) => {
  app.configureSounds({
    ring: ring
  });
}

const handleRing = (msg) => {
  const ring = msg.data;
  switch(ring) {
    case "original":
      app.resetSounds();
      ringStorage("delete")
      break;
    default:
      const sound = `http://localhost:8900/${ring}`;
      ringStorage("set", sound);
      setRing(sound);
      playSound();
  }
}

app.onBackgroundMessage = msg => {
  switch(msg.value) {
    case "ring":
      handleRing(msg);
      break;
   case "config":
     const ring = ringStorage();
     app.sendMessageToIframe({value: 'config', ring: ring});
     break;
  } 
}

(async () => {
  await app.initialize();
  const ring = ringStorage();
  if (ring) {
    setRing(ring);
  }
  console.log('ring background - background launched');
})();
