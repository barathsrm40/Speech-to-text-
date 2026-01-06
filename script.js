let recognition;
let isListening = false;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const output = document.getElementById("output");
const statusText = document.getElementById("status");
const languageSelect = document.getElementById("language");

// Check browser support
if (!("webkitSpeechRecognition" in window)) {
    alert("Speech Recognition not supported. Use Google Chrome.");
} else {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
}

// Start recording
startBtn.addEventListener("click", () => {
    recognition.lang = languageSelect.value;
    recognition.start();
    isListening = true;

    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.innerText = "Status: Listening...";
});

// Stop recording
stopBtn.addEventListener("click", () => {
    recognition.stop();
    isListening = false;

    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.innerText = "Status: Stopped";
});

// Clear text
clearBtn.addEventListener("click", () => {
    output.value = "";
});

// Capture results
recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
    }
    output.value += transcript + " ";
};

// Error handling
recognition.onerror = (event) => {
    statusText.innerText = "Error: " + event.error;
    startBtn.disabled = false;
    stopBtn.disabled = true;
};

// Auto restart if interrupted
recognition.onend = () => {
    if (isListening) {
        recognition.start();
    }
};