/* ========= SPEECH TO TEXT ========= */
let recognition;
let finalText = "";
let translating = false;

const speechText = document.getElementById("speechText");
const statusText = document.getElementById("status");

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    statusText.textContent = "Listening...";
    statusText.classList.add("listening");
  };

  recognition.onend = () => {
    statusText.textContent = "Stopped";
    statusText.classList.remove("listening");
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

    // 🔁 LIVE TRANSLATION (THROTTLED)
    if (!translating && speechText.value.trim().length > 5) {
      translating = true;
      liveTranslate(speechText.value.trim());
      setTimeout(() => translating = false, 2000);
    }
  };
}

document.getElementById("startSpeech").onclick = () => {
  finalText = speechText.value || "";
  recognition.start();
};

document.getElementById("stopSpeech").onclick = () => recognition.stop();

document.getElementById("resetSpeech").onclick = () => {
  finalText = "";
  speechText.value = "";
  document.getElementById("outputText").value = "";
  statusText.textContent = "Idle";
};

/* ========= LIVE TRANSLATION FUNCTION ========= */
async function liveTranslate(text) {
  const from = document.getElementById("fromLang").value;
  const to = document.getElementById("toLang").value;
  const output = document.getElementById("outputText");

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    const data = await res.json();
    output.value = data.responseData.translatedText;
  } catch {}
}

/* ========= MANUAL TRANSLATE ========= */
document.getElementById("translateBtn").onclick = () =>
  liveTranslate(document.getElementById("inputText").value);

/* ========= DOWNLOAD ========= */
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

document.getElementById("transTxt").onclick =
  () => downloadTXT(outputText.value, "translation.txt");

document.getElementById("transPdf").onclick =
  () => downloadPDF(outputText.value, "translation.pdf");