/* ========= SPEECH TO TEXT ========= */
let recognition;
const speechText = document.getElementById("speechText");

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let result = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      result += event.results[i][0].transcript;
    }
    speechText.value = result;
  };
}

document.getElementById("startSpeech").onclick = () => recognition.start();
document.getElementById("stopSpeech").onclick = () => recognition.stop();

/* ========= TRANSLATION (WORKING) ========= */
document.getElementById("translateBtn").onclick = async () => {
  const text = document.getElementById("inputText").value.trim();
  const from = document.getElementById("fromLang").value;
  const to = document.getElementById("toLang").value;
  const output = document.getElementById("outputText");

  if (!text) return alert("Enter text first");

  output.value = "Translating...";

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    const data = await res.json();
    output.value = data.responseData.translatedText;
  } catch {
    output.value = "";
    alert("Translation failed");
  }
};

/* ========= DOWNLOAD TXT ========= */
function downloadTXT(text, name) {
  if (!text) return alert("Nothing to download");
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

document.getElementById("speechTxt").onclick =
  () => downloadTXT(speechText.value, "speech.txt");

document.getElementById("transTxt").onclick =
  () => downloadTXT(document.getElementById("outputText").value, "translation.txt");

/* ========= DOWNLOAD PDF ========= */
function downloadPDF(text, name) {
  if (!text) return alert("Nothing to download");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 10);
  doc.save(name);
}

document.getElementById("speechPdf").onclick =
  () => downloadPDF(speechText.value, "speech.pdf");

document.getElementById("transPdf").onclick =
  () => downloadPDF(document.getElementById("outputText").value, "translation.pdf");