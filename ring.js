import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';
import i18next from 'https://cdn.jsdelivr.net/gh/i18next/i18next/src/index.js';

const ringElem = document.getElementById("ring");

const options = {
  "original": "Original",
  "iphone.wav": "Iphone",
  "landline1.wav": "Landline 1",
  "landline2.wav": "Landline 2",
  "marimba.wav": "Marimba",
  "ring3.wav": "Ring 3",
  "ring4.wav": "Ring 4",
  "ring5.wav": "Ring 5",
  "dark_side_ringtone.mp3": "Stars Wars"
};

app.onIframeMessage = (msg) => {
  if (msg.ring) {
    const ring = msg.ring.split("/").pop();
    ringElem.value = ring;
  }
}

const addOptionMenu = (options, idMenu) => {
  const menu = document.getElementById(idMenu);

  for (const option in options) {
    const newOption = document.createElement("option");
    newOption.text = options[option];
    newOption.value = option;
    menu.add(newOption);
  }
}

(async() => {
  await app.initialize();
  const context = app.getContext();
  const lang = context.app.locale;

  addOptionMenu(options, "ring");

  app.sendMessageToBackground({value: 'config'});
  ring.addEventListener("change", function() {
    const ring = ringElem.value;
    app.sendMessageToBackground({value: 'ring', data: ring});
  });

  await i18next.init({
    lng: lang,
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        translation: {
          "choose_ring": "Select your ringtone"
        }
      },
      fr: {
        translation: {
          "choose_ring": "Choisissez votre sonnerie"
        }
      }
    }
  });

  document.getElementById('choose-ring').innerHTML = i18next.t('choose_ring');
})();
