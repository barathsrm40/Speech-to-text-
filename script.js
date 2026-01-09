let recognition;
let listening = false;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const speechText = document.getElementById("speechText");
const translatedText = document.getElementById("translatedText");
const statusText = document.getElementById("status");
const speechLang = document.getElementById("speechLang");
const translateLang = document.getElementById("translateLang");

/* 🌍 Language list (speech + translation) */
const languages = {
    "en": "English",
    "ta": "Tamil",
    "hi": "Hindi",
    "te": "Telugu",
    "ml": "Malayalam",
    "kn": "Kannada",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "it": "Italian",
    "ru": "Russian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "pt": "Portuguese"
};

/* Populate dropdowns */
for (let code in languages) {
    speechLang.innerHTML += `<option value="${code}">${languages[code]}</option>`;
    translateLang.innerHTML += `<option value="${code}">${languages[code]}</option>`;
}

speechLang.value = "en";
translateLang.value = "ta";

/* Speech Recognition */
if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
} else {
    alert("Speech Recognition not supported. Use Chrome.");
}

startBtn.onclick = () => {
    recognition.lang = speechLang.value;
    recognition.start();
    listening = true;
    statusText.innerText = "Status: Listening...";
    startBtn.disabled = true;
    stopBtn.disabled = false;
};

stopBtn.onclick = () => {
    recognition.stop();
    listening = false;
    statusText.innerText = "Status: Stopped";
    startBtn.disabled = false;
    stopBtn.disabled = true;
};

clearBtn.onclick = () => {
    speechText.value = "";
    translatedText.value = "";
};

recognition.onresult = (event) => {
    let text = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
    }
    speechText.value += text + " ";
    translateText(speechText.value);
};

recognition.onend = () => {
    if (listening) recognition.start();
};

/* 🌐 Translation using LibreTranslate */
function translateText(text) {
    fetch("https://libretranslate.de/translate", {
        method: "POST",
        body: JSON.stringify({
            q: text,
            source: speechLang.value,
            target: translateLang.value,
            format: "text"
        }),
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        translatedText.value = data.translatedText;
    })
    .catch(() => {
        translatedText.value = "Translation error";
    });
}