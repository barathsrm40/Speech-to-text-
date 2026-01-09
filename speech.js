document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");
  const status = document.getElementById("status");
  const language = document.getElementById("language");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadTxtBtn = document.getElementById("downloadTxt");
  const downloadPdfBtn = document.getElementById("downloadPdf");

  let recognition;
  let finalText = "";
  let isListening = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { alert("Speech Recognition not supported."); return; }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => { isListening = true; status.textContent="🎧 Listening..."; status.style.color="green"; };
  recognition.onend = () => { isListening=false; status.textContent="Stopped"; status.style.color="red"; };
  recognition.onerror = (event) => { console.error(event.error); status.textContent="Error: "+event.error; status.style.color="orange"; };
  recognition.onresult = (event) => {
    let interim="";
    for (let i=event.resultIndex;i<event.results.length;i++){
      const transcript=event.results[i][0].transcript;
      if(event.results[i].isFinal) finalText += transcript+" ";
      else interim += transcript;
    }
    output.value = finalText + interim;
  };

  startBtn.onclick = () => { if(!isListening){ recognition.lang=language.value; try{ recognition.start(); }catch{} } };
  stopBtn.onclick = () => { if(isListening) recognition.stop(); };
  resetBtn.onclick = () => { finalText=""; output.value=""; status.textContent="Status: Idle"; status.style.color="#333"; };

  downloadTxtBtn.onclick = () => {
    if(!output.value) return alert("Nothing to download");
    const blob = new Blob([output.value],{type:"text/plain"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="speech.txt"; a.click();
  };

  downloadPdfBtn.onclick = () => {
    if(!output.value) return alert("Nothing to download");
    const doc = new window.jspdf.jsPDF();
    doc.text(doc.splitTextToSize(output.value,180),10,10);
    doc.save("speech.pdf");
  };
});