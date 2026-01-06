let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-IN'; // Change to ta-IN for Tamil
} else {
    alert("Speech Recognition not supported");
}

function startRecording() {
    recognition.start();
}

function stopRecording() {
    recognition.stop();
}

recognition.onresult = function(event) {
    let text = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
    }
    document.getElementById("output").value = text;
};
