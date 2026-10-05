import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { firebaseConfig } from "../firebase-config.js";

const LOCAL_KEY = "nossa-lista-items-v1";
const state = { items: [], firebaseReady: false, user: null, unsubscribe: null };
const $ = (id) => document.getElementById(id);
const form = $("itemForm"), nameInput = $("itemName"), quantityInput = $("quantity");
const categoryInput = $("category"), list = $("list"), empty = $("emptyState"), status = $("syncStatus");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const itemsRef = collection(db, "shoppingItems");

function uid(){ return crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random().toString(16).slice(2); }
function saveLocal(){ localStorage.setItem(LOCAL_KEY, JSON.stringify(state.items)); }
function loadLocal(){ try { state.items = JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { state.items=[]; } }
function setStatus(text, online=false){ status.textContent=text; status.classList.toggle("online", online); }

async function writeItem(item){
  if(!state.firebaseReady) throw new Error("Firebase ainda não está conectado.");
  await setDoc(doc(itemsRef, item.id), item);
}
async function addItem(name, quantity, category){
  const item={id:uid(), name:name.trim(), quantity:quantity.trim(), category, done:false, createdAt:Date.now()};
  if(state.firebaseReady){ await writeItem(item); } else { state.items.unshift(item); saveLocal(); render(); }
}
async function toggleItem(id){
  const item=state.items.find(x=>x.id===id); if(!item)return;
  const updated={...item,done:!item.done};
  if(state.firebaseReady) await writeItem(updated); else { Object.assign(item,updated); saveLocal(); render(); }
}
async function deleteItem(id){
  if(state.firebaseReady) await deleteDoc(doc(itemsRef,id));
  else { state.items=state.items.filter(x=>x.id!==id); saveLocal(); render(); }
}
async function clearDone(){
  if(state.firebaseReady){ const batch=writeBatch(db); state.items.filter(x=>x.done).forEach(x=>batch.delete(doc(itemsRef,x.id))); await batch.commit(); }
  else { state.items=state.items.filter(x=>!x.done); saveLocal(); render(); }
}

function render(){
  list.innerHTML=""; const groups={}; state.items.forEach(item=>(groups[item.category] ||= []).push(item));
  const categories=Object.keys(groups); empty.style.display=categories.length?"none":"block";
  categories.forEach(cat=>{ const section=document.createElement("div"); section.className="category"; const title=document.createElement("div"); title.className="category-title"; title.innerHTML=`<span>${cat}</span><span>${groups[cat].length}</span>`; section.appendChild(title);
    groups[cat].forEach(item=>{ const row=document.createElement("div"); row.className="item"+(item.done?" done":""); row.innerHTML=`<button class="check" aria-label="Marcar comprado">${item.done?"✓":""}</button><div class="item-info"><div class="item-name"></div><div class="meta"></div></div><button class="delete" aria-label="Excluir">×</button>`; row.querySelector(".item-name").textContent=item.name; row.querySelector(".meta").textContent=item.quantity?`Quantidade: ${item.quantity}`:"Sem quantidade"; row.querySelector(".check").onclick=()=>toggleItem(item.id).catch(showError); row.querySelector(".delete").onclick=()=>deleteItem(item.id).catch(showError); section.appendChild(row); }); list.appendChild(section); });
  const total=state.items.length, done=state.items.filter(x=>x.done).length; $("remaining").textContent=total-done; $("total").textContent=total; $("progress").textContent=total?Math.round(done/total*100)+"%":"0%";
}
function showError(error){ console.error(error); setStatus("Erro ao sincronizar"); alert("Não foi possível salvar no Firebase. Verifique se o Firestore e o login anônimo estão habilitados."); }

form.addEventListener("submit", async e=>{ e.preventDefault(); const name=nameInput.value.trim(); if(!name)return; const btn=form.querySelector("button[type=submit]"); btn.disabled=true;
  try { await addItem(name,quantityInput.value,categoryInput.value); nameInput.value=""; quantityInput.value=""; nameInput.focus(); } catch(error){ showError(error); } finally { btn.disabled=false; }
});
$("clearDoneBtn").onclick=()=>clearDone().catch(showError);

loadLocal(); render(); setStatus("Conectando ao Firebase...");

onAuthStateChanged(auth, user=>{
  if(!user){ state.firebaseReady=false; setStatus("Autenticando..."); return; }
  state.user=user; state.firebaseReady=true; setStatus("Firebase conectado • tempo real",true);
  if(state.unsubscribe) state.unsubscribe();
  state.unsubscribe=onSnapshot(itemsRef, snap=>{ state.items=snap.docs.map(d=>d.data()).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); saveLocal(); render(); }, error=>{ console.error(error); state.firebaseReady=false; setStatus("Erro no Firestore"); });
}, error=>{ console.error(error); state.firebaseReady=false; setStatus("Erro na autenticação"); });

signInAnonymously(auth).catch(error=>{ console.error(error); state.firebaseReady=false; setStatus("Ative o login anônimo no Firebase"); });
