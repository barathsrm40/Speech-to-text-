// Sidebar toggle
function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.transform = sidebar.style.transform === "translateX(-200px)" ? "translateX(0)" : "translateX(-200px)";
}

// Show modules
function showModule(id) {
    const modules = ["voiceModule","translateModule","pdfModule","imageModule"];
    modules.forEach(m => document.getElementById(m).style.display = "none");
    document.getElementById(id+"Module").style.display = "block";
}

/* ----------------- Voice Module ----------------- */
let recognition, listening = false;
if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
} else alert("Speech recognition not supported.");

const voiceOutput = document.getElementById("voiceOutput");

document.getElementById("startVoiceBtn").onclick = () => {
    recognition.lang = document.getElementById("voiceLang").value;
    recognition.start(); listening=true;
    document.getElementById("startVoiceBtn").disabled=true;
    document.getElementById("stopVoiceBtn").disabled=false;
};
document.getElementById("stopVoiceBtn").onclick = () => {
    recognition.stop(); listening=false;
    document.getElementById("startVoiceBtn").disabled=false;
    document.getElementById("stopVoiceBtn").disabled=true;
};
document.getElementById("clearVoiceBtn").onclick = () => { voiceOutput.value=""; };

recognition.onresult = (e) => {
    let text=""; for(let i=e.resultIndex;i<e.results.length;i++){text+=e.results[i][0].transcript;}
    voiceOutput.value+=text+" ";
};
recognition.onend = ()=>{ if(listening) recognition.start(); };

/* ----------------- Text Translate Module ----------------- */
const languages = {"en":"English","ta":"Tamil","hi":"Hindi","fr":"French","de":"German","es":"Spanish","zh":"Chinese","ja":"Japanese","ko":"Korean"};
const speechLang=document.getElementById("translateFrom"), translateLang=document.getElementById("translateTo");
for(let c in languages){speechLang.innerHTML+=`<option value="${c}">${languages[c]}</option>`; translateLang.innerHTML+=`<option value="${c}">${languages[c]}</option>`;}
speechLang.value="en"; translateLang.value="ta";

function translateTextManual(){
    let text=document.getElementById("textInput").value;
    fetch("https://libretranslate.de/translate",{
        method:"POST",
        body:JSON.stringify({q:text,source:speechLang.value,target:translateLang.value,format:"text"}),
        headers:{"Content-Type":"application/json"}
    }).then(res=>res.json()).then(data=>{document.getElementById("textTranslated").value=data.translatedText;}).catch(()=>{document.getElementById("textTranslated").value="Translation Error";});
}

/* ----------------- PDF Module ----------------- */
function translatePDF(){
    const file=document.getElementById("pdfFile").files[0];
    if(!file){alert("Select a PDF"); return;}
    const reader=new FileReader();
    reader.onload=function(e){
        const typedarray=new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedarray).promise.then(pdf=>{
            let maxPages=Math.min(pdf.numPages,50); // max 50 pages
            let promises=[];
            for(let i=1;i<=maxPages;i++){
                promises.push(pdf.getPage(i).then(page=>page.getTextContent().then(tc=>tc.items.map(it=>it.str).join(" "))));
            }
            Promise.all(promises).then(pages=>{
                let text=pages.join("\n");
                // Translate PDF text
                fetch("https://libretranslate.de/translate",{
                    method:"POST",
                    body:JSON.stringify({q:text,source:speechLang.value,target:translateLang.value,format:"text"}),
                    headers:{"Content-Type":"application/json"}
                }).then(res=>res.json()).then(data=>{document.getElementById("pdfOutput").value=data.translatedText;});
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

/* ----------------- Image Module ----------------- */
function translateImage(){
    const file=document.getElementById("imgFile").files[0];
    if(!file){alert("Select an image"); return;}
    // Use Tesseract.js for OCR
    const reader=new FileReader();
    reader.onload=function(e){
        Tesseract.recognize(e.target.result,'eng',{logger:m=>console.log(m)}).then(result=>{
            const text=result.data.text;
            fetch("https://libretranslate.de/translate",{
                method:"POST",
                body:JSON.stringify({q:text,source:"en",target:translateLang.value,format:"text"}),
                headers:{"Content-Type":"application/json"}
            }).then(res=>res.json()).then(data=>{document.getElementById("imgOutput").value=data.translatedText;});
        });
    };
    reader.readAsDataURL(file);
}

/* ----------------- Download Functions ----------------- */
function downloadText(id,filename){
    const text=document.getElementById(id).value;
    const blob=new Blob([text],{type:"text/plain"});
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=filename;
    link.click();
}
function downloadPDF(id,filename){
    const element=document.getElementById(id);
    html2pdf().from(element).set({filename:filename}).save();
}