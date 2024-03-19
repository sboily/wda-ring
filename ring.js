// Imports
import { App } from 'https://cdn.jsdelivr.net/npm/@wazo/euc-plugins-sdk@0.0.22/lib/esm/app.js';
import i18next from 'https://cdn.jsdelivr.net/gh/i18next/i18next/src/index.js';

// Global variables
let audio;
let appUrl;
const app = new App();
const ringOptions = {
  "original": "Reset to original",
  "iphone.mp3": "Iphone",
  "iphone6.mp3": "Iphone 6",
  "landline1.wav": "Landline 1",
  "landline2.wav": "Landline 2",
  "marimba.wav": "Marimba 1",
  "marimba.mp3": "Marimba 2",
  "ring3.wav": "Ring 3",
  "ring4.wav": "Ring 4",
  "ring5.wav": "Ring 5",
  "dark_side_ringtone.mp3": "Star Wars",
  "bird2.mp3": "Bird",
  "sf-oiseau-24.mp3": "Bird 1",
  "oiseau2.mp3": "Bird 2",
  "sf_oiseau_seul_01.mp3": "Bird 3",
  "sf_oiseaux.mp3": "Bird 4",
  "sf_canari.mp3": "Canary",
  "zelda_lost_woods.mp3": "Zelda 1",
  "hedwigs.mp3": "Harry Potter",
  "lg_bubble.mp3": "Bubble",
  "marimba.wav": "Marimba",
  "stranger_things.mp3": "Stranger Things",
  "breaking_bad.mp3": "Breaking Bad",
  "huawei.mp3": "Huawei",
  "lg_peanut.mp3": "Peanut",
  "xylo.mp3": "Xylophone"
};

// Initialize app and add event listeners
async function initializeApp() {
  await app.initialize();
  const context = app.getContext();
  appUrl = context.app.extra.baseUrl;
  setupI18n(context.app.locale);
  cloneRingContainer();
  populateRingOptions(["externalRing", "internalRing"]);
  setupEventListeners();
  app.sendMessageToBackground({value: 'config', type: 'external'});
  app.sendMessageToBackground({value: 'config', type: 'internal'});
}

app.onIframeMessage = (msg) => {
  if (msg.ring) {
    const ring = msg.ring.split("/").pop();
    if (msg.type == "external") {
      const externalRingElem = document.getElementById("externalRing");
      externalRingElem.value = ring;
    }

    if (msg.type == "internal") {
      const internalRingElem = document.getElementById("internalRing");
      internalRingElem.value = ring;
    }
  }
}

// Setup i18next for internationalization
async function setupI18n(lang) {
  await i18next.init({
    lng: lang,
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        translation: {
          "external_call": "External Call",
          "internal_call": "Internal Call",
          "choose_external_ring": "Select your ringtone",
          "choose_internal_ring": "Select your ringtone"
        }
      },
      fr: {
        translation: {
          "external_call": "Appel Externe",
          "internal_call": "Appel Interne",
          "choose_external_ring": "Choisissez votre sonnerie",
          "choose_internal_ring": "Choisissez votre sonnerie"
        }
      }
    }
  });
  updateTexts();
}

// Update texts based on current language
function updateTexts() {
  document.getElementById('chooseExternalRing').textContent = i18next.t('choose_external_ring');
  document.getElementById('chooseInternalRing').textContent = i18next.t('choose_internal_ring');
  document.getElementById('externalCall').textContent = i18next.t('external_call');
  document.getElementById('internalCall').textContent = i18next.t('internal_call');
}

// Clone ring container for internal use
function cloneRingContainer() {
  const originalDiv = document.getElementById("externalRingContainer");
  const clonedDiv = originalDiv.cloneNode(true);
  updateClonedDivIds(clonedDiv);
  originalDiv.insertAdjacentElement('afterend', clonedDiv);
}

// Update IDs of cloned elements for uniqueness
function updateClonedDivIds(clonedDiv) {
  clonedDiv.id = "ringInternalContainer";
  clonedDiv.querySelector("#externalCall").id = "internalCall";
  clonedDiv.querySelector("#externalRing").id = "internalRing";
  clonedDiv.querySelector("#chooseExternalRing").id = "chooseInternalRing";
  clonedDiv.querySelector("#externalPlayButton").id = "internalPlayButton";
  clonedDiv.querySelector("#externalStopButton").id = "internalStopButton";
}

// Populate ring options in select elements
function populateRingOptions(ids) {
  ids.forEach(id => {
    const selectElement = document.getElementById(id);
    Object.entries(ringOptions).forEach(([value, text]) => {
      const option = new Option(text, value);
      selectElement.add(option);
    });
  });
}

// Setup event listeners for UI interactions
function setupEventListeners() {
  document.querySelectorAll("select[id$='Ring']").forEach(select => {
    select.addEventListener("change", handleRingChange);
  });
  document.querySelectorAll("button[id$='PlayButton']").forEach(button => {
    button.addEventListener("click", playRingbackTone);
  });
  document.querySelectorAll("button[id$='StopButton']").forEach(button => {
    button.addEventListener("click", stopRingbackTone);
  });
}

// Handle ring selection change
function handleRingChange(event) {
  const { id, value } = event.target;
  const type = id.includes("external") ? "external" : "internal";
  app.sendMessageToBackground({ value: 'ring', type, data: value });
  stopRingbackTone();
}

// Play selected ringback tone
function playRingbackTone(event) {
  stopRingbackTone();

  const buttonId = event.currentTarget.id;
  const ringElementId = buttonId.replace("PlayButton", "Ring");
  const ringSelect = document.getElementById(ringElementId);

  if (!ringSelect) {
    console.error(`No select element found with ID: ${ringElementId}`);
    return;
  }

  const ring = ringSelect.value;
  const path = `${appUrl}/sounds/${ring}`;

  audio = new Audio(path);
  audio.play().catch(e => console.error("Error playing the audio", e));
}

// Stop playing the ringback tone
function stopRingbackTone() {
  if (audio) {
    audio.pause();
    audio = null;
  }
}

// Initialize the app
initializeApp();
