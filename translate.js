document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("inputText");
  const outputText = document.getElementById("outputText");
  const fromLang = document.getElementById("fromLang");
  const toLang = document.getElementById("toLang");
  const translateBtn = document.getElementById("translateBtn");
  const transTxtBtn = document.getElementById("transTxt");
  const transPdfBtn = document.getElementById("transPdf");

  translateBtn.onclick = async () => {
    if(!inputText.value.trim()) return alert("Enter text to translate");
    outputText.value="Translating...";
    try{
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText.value)}&langpair=${fromLang.value}|${toLang.value}`);
      const data = await res.json();
      outputText.value = data.responseData.translatedText;
    }catch(err){
      console.error(err); outputText.value=""; alert("Translation failed");
    }
  };

  function downloadTXT(text,name){
    if(!text) return alert("Nothing to download");
    const blob=new Blob([text],{type:"text/plain"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; a.click();
  }
  function downloadPDF(text,name){
    if(!text) return alert("Nothing to download");
    const doc=new window.jspdf.jsPDF();
    doc.text(doc.splitTextToSize(text,180),10,10); doc.save(name);
  }

  transTxtBtn.onclick=()=>downloadTXT(outputText.value,"translation.txt");
  transPdfBtn.onclick=()=>downloadPDF(outputText.value,"translation.pdf");
});