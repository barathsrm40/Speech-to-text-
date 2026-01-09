// ---------------- Sidebar ----------------
function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.transform = sidebar.style.transform === "translateX(-200px)" ? "translateX(0)" : "translateX(-200px)";
}
function showModule(id) {
    const modules=["voiceModule","translateModule","pdfModule","imageModule"];
    modules.forEach(m => document.getElementById(m).style.display="none");
    document.getElementById(id+"Module").style.display="block";
}

// ---------------- Languages ----------------
const languages={"en":"English","ta":"Tamil","hi":"Hindi","fr":"French","de":"German","es":"Spanish","zh":"Chinese","ja":"Japanese","ko":"Korean"};
const voiceLang=document.getElementById("voiceLang");
const translateFrom=document.getElementById("translateFrom");
const translateTo=document.getElementById("translateTo");
for(let c in languages){
    voiceLang.innerHTML+=`<option value="${c}">${languages[c]}</option>`;
    translateFrom.innerHTML+=`<option value="${c}">${languages[c]}</option>`;
    translateTo.innerHTML+=`<option value="${c}">${languages[c]}</option>`;
}
voiceLang.value="en"; translateFrom.value="en"; translateTo.value="ta";

// ---------------- Voice Module ----------------
let recognition, listening=false;
const voiceOutput=document.getElementById("voiceOutput");
if("webkitSpeechRecognition" in window){
    recognition=new webkitSpeechRecognition();
    recognition.continuous=true;
}else alert("Speech recognition not supported.");

document.getElementById("startVoiceBtn").onclick=()=>{
    recognition.lang=voiceLang.value;
    recognition.start(); listening=true;
    document.getElementById("startVoiceBtn").disabled=true;
    document.getElementById("stopVoiceBtn").disabled=false;
};
document.getElementById("stopVoiceBtn").onclick=()=>{
    recognition.stop(); listening=false;
    document.getElementById("startVoiceBtn").disabled=false;
    document.getElementById("stopVoiceBtn").disabled=true;
};
document.getElementById("clearVoiceBtn").onclick=()=>{voiceOutput.value="";};
recognition.onresult=(e)=>{
    let text=""; for(let i=e.resultIndex;i<e.results.length;i++){text+=e.results[i][0].transcript;}
    voiceOutput.value+=text+" ";
};
recognition.onend=()=>{if(listening) recognition.start();};

// ---------------- Text Translate ----------------
function translateTextManual(){
    const text=document.getElementById("textInput").value;
    fetch("https://libretranslate.de/translate",{
        method:"POST",
        body:JSON.stringify({q:text,source:translateFrom.value,target:translateTo.value,format:"text"}),
        headers:{"Content-Type":"application/json"}
    }).then(res=>res.json()).then(data=>{document.getElementById("textTranslated").value=data.translatedText;})
      .catch(()=>{document.getElementById("textTranslated").value="Translation Error";});
}

// ---------------- PDF Translate ----------------
function translatePDF(){
    const file=document.getElementById("pdfFile").files[0];
    if(!file){alert("Select a PDF"); return;}
    const reader=new FileReader();
    reader.onload=function(e){
        const typedarray=new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedarray).promise.then(pdf=>{
            let pages=Math.min(pdf.numPages,50);
            let promises=[];
            for(let i=1;i<=pages;i++){
                promises.push(pdf.getPage(i).then(pg=>pg.getTextContent().then(tc=>tc.items.map(it=>it.str).join(" "))));
            }
            Promise.all(promises).then(txt=>{
                const fullText=txt.join("\n");
                fetch("https://libretranslate.de/translate",{
                    method:"POST",
                    body:JSON.stringify({q:fullText,source:translateFrom.value,target:translateTo.value,format:"text"}),
                    headers:{"Content-Type":"application/json"}
                }).then(res=>res.json()).then(data=>{document.getElementById("pdfOutput").value=data.translatedText;});
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

// ---------------- Image Translate ----------------
function translateImage(){
    const file=document.getElementById("imgFile").files[0];
    if(!file){alert("Select an image"); return;}
    const reader=new FileReader();
    reader.onload=function(e){
        Tesseract.recognize(e.target.result,'eng',{logger:m=>console.log(m)}).then(result=>{
            const text=result.data.text;
            fetch("https://libretranslate.de/translate",{
                method:"POST",
                body:JSON.stringify({q:text,source:"en",target:translateTo.value,format:"text"}),
                headers:{"Content-Type":"application/json"}
            }).then(res=>res.json()).then(data=>{document.getElementById("imgOutput").value=data.translatedText;});
        });
    };
    reader.readAsDataURL(file);
}

// ---------------- Download ----------------
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