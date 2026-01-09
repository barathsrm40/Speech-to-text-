let recognition;
let finalText = "";

const speechText = document.getElementById("speechText");
const translatedSpeech = document.getElementById("translatedSpeech");
const statusText = document.getElementById("status");

const startBtn = document.getElementById("startSpeech");
const stopBtn = document.getElementById("stopSpeech");
const resetBtn = document.getElementById("resetSpeech");

const speechLang = document.getElementById("speechLang");
const targetLang = document.getElementById("targetLang");

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    statusText.textContent = "🎙️ Listening...";
    statusText.style.color = "green";
  };

  recognition.onend = () => {
    statusText.textContent = "Stopped";
    statusText.style.color = "#666";
  };

  recognition.onresult = async (event) => {
    let interim = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript + " ";
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    speechText.value = finalText + interim;

    // Live translation only when final text updates
    if (finalText.trim()) {
      translateLive(finalText.trim());
    }
  };

  recognition.onerror = (e) => {
    statusText.textContent = "Error: " + e.error;
    statusText.style.color = "red";
  };
}

startBtn.onclick = () => {
  recognition.lang = speechLang.value;
  recognition.start();
};

stopBtn.onclick = () => recognition.stop();

resetBtn.onclick = () => {
  finalText = "";
  speechText.value = "";
  translatedSpeech.value = "";
  statusText.textContent = "Idle";
};

/* 🔁 LIVE TRANSLATION */
async function translateLive(text) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang.value}`
    );
    const data = await res.json();
    translatedSpeech.value = data.responseData.translatedText;
  } catch {
    translatedSpeech.value = "Translation error";
  }
}

/* 📄 DOWNLOAD */
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

document.getElementById("speechTxt").onclick =
  () => downloadTXT(speechText.value, "speech.txt");

document.getElementById("speechPdf").onclick =
  () => downloadPDF(speechText.value, "speech.pdf");