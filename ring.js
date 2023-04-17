import app from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@latest/lib/esm/app.js';
import i18next from 'https://cdn.jsdelivr.net/gh/i18next/i18next/src/index.js';

const ringElem = document.getElementById("ring");

app.onIframeMessage = (msg) => {
  const ring = msg.ring.split("/").pop();
  ringElem.value = ring;
}

(async() => {
  await app.initialize();
  const context = app.getContext();
  const lang = context.app.locale;

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
