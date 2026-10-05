import {
  auth, db, signInAnonymously,
  collection, addDoc, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, writeBatch, getDocs
} from "../firebase.js";

const state = { items: [], user: null, unsubscribe: null, ready: false };
const $ = (id) => document.getElementById(id);

const form = $("itemForm");
const nameInput = $("itemName");
const quantityInput = $("quantity");
const categoryInput = $("category");
const list = $("list");
const empty = $("emptyState");
const status = $("syncStatus");

const collectionRef = collection(db, "shoppingItems");

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
}

function setStatus(text, online = true) {
  status.textContent = text;
  status.classList.toggle("online", online);
}

function normalize(item) {
  return {
    id: item.id,
    name: String(item.name || "").trim(),
    quantity: String(item.quantity || "").trim(),
    category: item.category || "Outros",
    done: Boolean(item.done),
    createdAt: item.createdAt?.toMillis?.() || item.createdAt || 0
  };
}

async function addItem(name, quantity, category) {
  if (!state.user) {
    setStatus("Aguardando conexão com o Firebase...", false);
    return false;
  }
  try {
    await addDoc(collectionRef, {
      name: name.trim(),
      quantity: quantity.trim(),
      category,
      done: false,
      createdAt: serverTimestamp(),
      owner: state.user.uid
    });
    setStatus("Item salvo no Firebase");
    return true;
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    const code = error?.code || "";
    if (code.includes("permission-denied")) setStatus("Firebase: permissão negada", false);
    else if (code.includes("unauthenticated")) setStatus("Firebase: autenticação não ativa", false);
    else setStatus("Erro ao salvar no Firebase", false);
    return false;
  }
}

async function toggleItem(id, done) {
  try {
    await updateDoc(doc(db, "shoppingItems", id), { done: !done });
  } catch (error) {
    console.error(error);
    setStatus("Erro ao atualizar", false);
  }
}

async function deleteItem(id) {
  try {
    await deleteDoc(doc(db, "shoppingItems", id));
  } catch (error) {
    console.error(error);
    setStatus("Erro ao excluir", false);
  }
}

async function clearDone() {
  try {
    const snapshot = await getDocs(collectionRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((item) => {
      if (item.data().done === true) batch.delete(item.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error(error);
    setStatus("Erro ao limpar", false);
  }
}

function render() {
  list.innerHTML = "";
  const groups = {};
  state.items.forEach(item => (groups[item.category] ||= []).push(item));

  const categories = Object.keys(groups);
  empty.style.display = categories.length ? "none" : "block";

  categories.forEach(category => {
    const section = document.createElement("div");
    section.className = "category";

    const title = document.createElement("div");
    title.className = "category-title";

    const titleName = document.createElement("span");
    titleName.textContent = category;
    const count = document.createElement("span");
    count.textContent = groups[category].length;

    title.append(titleName, count);
    section.appendChild(title);

    groups[category]
      .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt)
      .forEach(item => {
        const row = document.createElement("div");
        row.className = "item" + (item.done ? " done" : "");

        const check = document.createElement("button");
        check.className = "check";
        check.type = "button";
        check.setAttribute("aria-label", item.done ? "Marcar como pendente" : "Marcar como comprado");
        check.textContent = item.done ? "✓" : "";
        check.onclick = () => toggleItem(item.id, item.done);

        const info = document.createElement("div");
        info.className = "item-info";

        const itemName = document.createElement("div");
        itemName.className = "item-name";
        itemName.textContent = item.name;

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = item.quantity ? `Quantidade: ${item.quantity}` : "Sem quantidade";

        info.append(itemName, meta);

        const del = document.createElement("button");
        del.className = "delete";
        del.type = "button";
        del.setAttribute("aria-label", "Excluir");
        del.textContent = "×";
        del.onclick = () => deleteItem(item.id);

        row.append(check, info, del);
        section.appendChild(row);
      });

    list.appendChild(section);
  });

  const total = state.items.length;
  const done = state.items.filter(x => x.done).length;
  $("remaining").textContent = total - done;
  $("total").textContent = total;
  $("progress").textContent = total ? Math.round(done / total * 100) + "%" : "0%";
}

function listenToList() {
  if (state.unsubscribe) state.unsubscribe();

  const q = query(collectionRef, orderBy("createdAt", "desc"));
  state.unsubscribe = onSnapshot(q, snapshot => {
    state.items = snapshot.docs.map(d => normalize({ id: d.id, ...d.data() }));
    state.ready = true;
    render();
    setStatus("Sincronizado em tempo real");
  }, error => {
    console.error(error);
    setStatus("Sem conexão com o Firebase", false);
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  const button = form.querySelector(".add-btn");
  button.disabled = true;
  const saved = await addItem(name, quantityInput.value, categoryInput.value);
  button.disabled = false;

  if (saved) {
    nameInput.value = "";
    quantityInput.value = "";
    nameInput.focus();
  }
});

$("clearDoneBtn").addEventListener("click", clearDone);

(async function init() {
  setStatus("Conectando ao Firebase...", false);

  try {
    const result = await signInAnonymously(auth);
    state.user = result.user;
    setStatus("Conectado ao Firebase");
    listenToList();
  } catch (error) {
    console.error("Erro de autenticação Firebase:", error);
    if (error?.code === "auth/operation-not-allowed") {
      setStatus("Ative o login anônimo no Firebase", false);
    } else if (error?.code === "auth/configuration-not-found") {
      setStatus("Firebase Authentication não configurado", false);
    } else {
      setStatus("Não foi possível conectar ao Firebase", false);
    }
  }
})();
