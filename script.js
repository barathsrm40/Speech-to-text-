/* ================= SPEECH TO TEXT ================= */

const speechText = document.getElementById("speechText");
const statusText = document.getElementById("listeningStatus");

const startBtn = document.getElementById("startSpeech");
const stopBtn = document.getElementById("stopSpeech");
const resetBtn = document.getElementById("resetSpeech");

const speechTxtBtn = document.getElementById("speechTxt");
const speechPdfBtn = document.getElementById("speechPdf");

const translateBtn = document.getElementById("translateBtn");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const fromLang = document.getElementById("fromLang");
const toLang = document.getElementById("toLang");

const transTxtBtn = document.getElementById("transTxt");
const transPdfBtn = document.getElementById("transPdf");

let recognition;
let finalTranscript = "";
let isUserStopped = false;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    statusText.textContent = "🎧 Listening...";
    statusText.style.color = "green";
  };

  recognition.onend = () => {
    if (!isUserStopped) {
      recognition.start();
    } else {
      statusText.textContent = "Stopped";
      statusText.style.color = "red";
    }
  };

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const txt = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += txt + " ";
      } else {
        interim = txt;
      }
    }
    speechText.value = finalTranscript + interim;
  };
}

/* BUTTON EVENTS */

startBtn.onclick = () => {
  isUserStopped = false;
  try { recognition.start(); } catch {}
};

stopBtn.onclick = () => {
  isUserStopped = true;
  recognition.stop();
};

resetBtn.onclick = () => {
  finalTranscript = "";
  speechText.value = "";
  statusText.textContent = "Idle";
  statusText.style.color = "#555";
};

/* ================= TRANSLATION ================= */

translateBtn.onclick = async () => {
  if (!inputText.value.trim()) return alert("Enter text");
  outputText.value = "Translating...";

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText.value)}&langpair=${fromLang.value}|${toLang.value}`
    );
    const data = await res.json();
    outputText.value = data.responseData.translatedText;
  } catch {
    outputText.value = "";
    alert("Translation failed");
  }
};

/* ================= DOWNLOAD ================= */

function downloadTXT(text, name) {
  if (!text) return alert("Nothing to download");
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

function downloadPDF(text, name) {
  if (!text) return alert("Nothing to download");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(doc.splitTextToSize(text, 180), 10, 10);
  doc.save(name);
}

speechTxtBtn.onclick = () => downloadTXT(speechText.value, "speech.txt");
speechPdfBtn.onclick = () => downloadPDF(speechText.value, "speech.pdf");
transTxtBtn.onclick = () => downloadTXT(outputText.value, "translation.txt");
transPdfBtn.onclick = () => downloadPDF(outputText.value, "translation.pdf");