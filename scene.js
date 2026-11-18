'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const mint = '#9ef4dc';
const amber = '#ffcb7d';
const ink = '#152129';
const duration = 8;
const controls = [...document.querySelectorAll('#settings input')];
const settings = Object.fromEntries(controls.map(input => [
  input.id, input.type === 'number' ? Number(input.value) : input.value
]));
controls.forEach(input => input.addEventListener('input', () => {
  if (input.type === 'number' && (input.value === '' || !input.validity.valid)) return;
  settings[input.id] = input.type === 'number' ? input.valueAsNumber : input.value;
  draw();
}));

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

const range = length => Array.from({length}, (_, index) => index);

function render(t) {
  const p = (t % settings.period) / settings.period;
  range(settings.count).forEach(i => {
    const x = 360 + Math.cos(i * 2.4) * (35 + i * 4) * p;
    const y = 283 - (90 + i % 11 * 17) * Math.sin(Math.PI * p);
    rect(Math.round(x / settings.pixel) * settings.pixel, Math.round(y / settings.pixel) * settings.pixel, settings.pixel - 1, settings.pixel - 1, i % 3 ? mint : amber);
  });
  rect(240, 296, 240, 8, mint);
}

const seek = document.querySelector('#seek');
const play = document.querySelector('#play');
const time = document.querySelector('#time');
let position = 0;
let playing = false;
let previous = null;
let animationId = null;

function draw() {
  rect(0, 0, canvas.width, canvas.height, ink);
  render(position);
  seek.value = position;
  time.value = `${position.toFixed(2)} ${language === 'en' ? 's' : 'sn'}`;
}

function frame(timestamp) {
  if (!playing) return;
  if (previous !== null) position = (position + (timestamp - previous) / 1000) % duration;
  previous = timestamp;
  draw();
  animationId = requestAnimationFrame(frame);
}

play.addEventListener('click', () => {
  playing = !playing;
  updatePlaybackLabel();
  if (playing) {
    previous = null;
    animationId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});

seek.addEventListener('input', () => {
  position = Number(seek.value);
  draw();
});

document.querySelector('#save').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'pixel-splash.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

const copy = {"title": ["Piksel parçacıkları", "Pixel Splash"], "description": ["Izgaraya oturan deterministik bir su sıçraması oluştur.", "Tune particle count, pixel size and loop duration."], "preview": ["Seçili hareket deneyinin önizlemesi", "Animation preview"], "timeline": ["Zaman çizelgesi", "Timeline"], "settings": ["Sahne ayarları", "Scene settings"], "save": ["PNG indir", "Download PNG"], "count": ["Parçacık sayısı", "Particle count"], "pixel": ["Piksel boyutu", "Pixel size"], "period": ["Döngü süresi (s)", "Loop duration (s)"]};
const dictionary = {"Debi": "Flow", "ÇIKIŞ DEBİSİ": "OUTLET FLOW", "Normal çalışma": "Operating normally", "Ölçüm birimi görünür": "Unit is visible", "Durum etiketi okunur": "Status label is legible", "Geçiş sekiz saniyeye sığar": "Transition fits in eight seconds", "SU AKIŞI": "WATER FLOW", "Yalova · Su istasyonu": "Yalova · Water station", "İstasyon": "Station", "Komut": "Prompt", "Tohum": "Seed", "Örnekle": "Sample", "Çıktı": "Output", "Suyu sarı bir uyarı çizgisiyle anlat.": "Show the water as a yellow alert line.", "Akışı camgöbeği bir dalgaya dönüştür.": "Turn the flow into a cyan wave.", "Veriyi noktalardan oluşan bir haritaya işle.": "Map the data as a field of dots.", "Akış": "Flow", "Ölçüm": "Reading", "Mavi saat": "Blue hour", "Bakır günbatımı": "Copper sunset", "Yeşil şafak": "Green dawn", "Kare": "Frame", "Oynat": "Play", "Duraklat": "Pause"};
const fieldDefaults = {};
let language = 'tr';
function translate(value) {
  return language === 'en' ? (Object.hasOwn(dictionary, value) ? dictionary[value] : value) : value;
}
function updatePlaybackLabel() {
  play.textContent = translate(playing ? 'Duraklat' : 'Oynat');
}
function setLanguage(next) {
  const previousLanguage = language;
  language = next;
  document.documentElement.lang = next;
  const index = next === 'en' ? 1 : 0;
  document.title = copy.title[index];
  for (const item of document.querySelectorAll('[data-i18n]')) item.textContent = copy[item.dataset.i18n][index];
  for (const item of document.querySelectorAll('[data-i18n-label]')) item.setAttribute('aria-label', copy[item.dataset.i18nLabel][index]);
  for (const code of ['tr', 'en']) document.querySelector('#lang-' + code).setAttribute('aria-pressed', String(code === next));
  if (previousLanguage !== next) {
    for (const field of document.querySelectorAll('#settings input[type="text"]')) {
      const original = field.defaultValue;
      const english = Object.hasOwn(fieldDefaults, original) ? fieldDefaults[original] : original;
      if (field.value === (previousLanguage === 'en' ? english : original)) {
        field.value = next === 'en' ? english : original;
        field.dispatchEvent(new Event('input'));
      }
    }
  }
  updatePlaybackLabel();
  draw();
}
for (const code of ['tr', 'en']) document.querySelector('#lang-' + code).addEventListener('click', () => setLanguage(code));

setLanguage('tr');
