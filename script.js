/* ================= SPEECH TO TEXT ================= */

const speechText = document.getElementById("speechText");
const statusText = document.getElementById("listeningStatus");

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
    // 🔁 Auto restart ONLY if user didn't stop
    if (!isUserStopped) {
      recognition.start();
    } else {
      statusText.textContent = "Stopped";
      statusText.style.color = "red";
    }
  };

  recognition.onerror = (e) => {
    console.warn("Speech error:", e.error);
  };

  recognition.onresult = (event) => {
    let interimText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimText = transcript;
      }
    }

    // ✅ No duplication
    speechText.value = finalTranscript + interimText;
  };
}

/* BUTTONS */

document.getElementById("startSpeech").onclick = () => {
  if (!recognition) return alert("Speech not supported");

  isUserStopped = false;
  try {
    recognition.start();
  } catch {}
};

document.getElementById("stopSpeech").onclick = () => {
  isUserStopped = true;
  recognition.stop();
};

document.getElementById("resetSpeech").onclick = () => {
  finalTranscript = "";
  speechText.value = "";
  statusText.textContent = "Idle";
  statusText.style.color = "#555";
};

/* ================= TRANSLATION (UNCHANGED) ================= */

document.getElementById("translateBtn").onclick = async () => {
  const text = inputText.value.trim();
  if (!text) return alert("Enter text");

  outputText.value = "Translating...";

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang.value}|${toLang.value}`
    );
    const data = await res.json();
    outputText.value = data.responseData.translatedText;
  } catch {
    alert("Translation failed");
    outputText.value = "";
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

speechTxt.onclick = () => downloadTXT(speechText.value, "speech.txt");
speechPdf.onclick = () => downloadPDF(speechText.value, "speech.pdf");
transTxt.onclick = () => downloadTXT(outputText.value, "translation.txt");
transPdf.onclick = () => downloadPDF(outputText.value, "translation.pdf");