// Speech-to-Text
let recognition, isRecording = false;
const textOutput = document.getElementById('textOutput');

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        textOutput.value = transcript;
    };

    recognition.onerror = (event) => alert("Error: " + event.error);
} else {
    alert("Your browser does not support Speech Recognition API. Use Chrome or Edge.");
}

document.getElementById('startBtn')?.addEventListener('click', () => {
    if (!isRecording) { recognition.start(); isRecording = true; }
});
document.getElementById('stopBtn')?.addEventListener('click', () => {
    if (isRecording) { recognition.stop(); isRecording = false; }
});

// Translation
const translateBtn = document.getElementById('translateBtn');
const textInput = document.getElementById('textInput');
const translatedText = document.getElementById('translatedText');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');

translateBtn?.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) return alert("Enter text first!");
    translatedText.value = "Translating...";

    try {
        const response = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            body: JSON.stringify({q: text, source: sourceLang.value, target: targetLang.value, format: "text"}),
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        translatedText.value = data.translatedText;
    } catch (err) {
        translatedText.value = "";
        alert("Translation failed! " + err);
    }
});

// Download TXT
function downloadText(content, filename){
    if(!content) return alert("Nothing to download!");
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

document.getElementById('downloadTxtST')?.addEventListener('click', () => downloadText(textOutput.value, "speech.txt"));
document.getElementById('downloadTxtTR')?.addEventListener('click', () => downloadText(translatedText.value, "translation.txt"));

// Download PDF
function downloadPDF(content, filename){
    if(!content) return alert("Nothing to download!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 10);
    doc.save(filename);
}

document.getElementById('downloadPdfST')?.addEventListener('click', () => downloadPDF(textOutput.value, "speech.pdf"));
document.getElementById('downloadPdfTR')?.addEventListener('click', () => downloadPDF(translatedText.value, "translation.pdf"));

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    });
});