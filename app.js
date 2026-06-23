// =========================================================
// LOGIQUE DE L'APPLICATION
// =========================================================

// On charge les données : si une version modifiée existe dans le
// navigateur (mode édition), on l'utilise ; sinon celle de data.js
let DATA = loadData();
let editMode = false;

function loadData(){
  const saved = localStorage.getItem("logistique_data");
  if(saved){
    try{ return JSON.parse(saved); }catch(e){ console.warn("Données locales invalides, fallback sur data.js"); }
  }
  return JSON.parse(JSON.stringify(APP_DATA));
}

function saveData(){
  localStorage.setItem("logistique_data", JSON.stringify(DATA));
}

function getPoste(id){ return DATA.postes.find(p=>p.id===id); }
function getEmploye(id){ return DATA.employes.find(e=>e.id===id); }
function getFonction(id){ return DATA.fonctions.find(f=>f.id===id); }

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav.tabs button").forEach(btn=>{
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  document.getElementById("editToggle").addEventListener("click", toggleEditMode);
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("resetBtn").addEventListener("click", resetData);

  document.getElementById("posteSearch").addEventListener("input", renderPostes);
  document.getElementById("fonctionSearch").addEventListener("input", renderFonctions);
  document.getElementById("addPosteBtn").addEventListener("click", ()=>openPosteForm(null));
  document.getElementById("addFonctionBtn").addEventListener("click", ()=>openFonctionForm(null));
  document.getElementById("addEmployeBtn").addEventListener("click", ()=>openEmployeForm(null));

  document.querySelectorAll(".close-btn").forEach(b=>b.addEventListener("click", closeAllModals));
  document.querySelectorAll(".modal-overlay").forEach(o=>{
    o.addEventListener("click", e=>{ if(e.target===o) closeAllModals(); });
  });

  renderAll();
});

function switchTab(tab){
  document.querySelectorAll("nav.tabs button").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active", p.id===tab));
}

function renderAll(){
  renderOrgChart();
  renderPostes();
  renderFonctions();
}

function toggleEditMode(){
  editMode = !editMode;
  document.getElementById("editToggle").classList.toggle("active", editMode);
  document.getElementById("editToggle").textContent = editMode ? "✓ Mode édition actif" : "Mode édition";
  document.getElementById("addPosteBtn").style.display = editMode ? "inline-block" : "none";
  document.getElementById("addFonctionBtn").style.display = editMode ? "inline-block" : "none";
  document.getElementById("addEmployeBtn").style.display = editMode ? "inline-block" : "none";
  renderAll();
}

function exportData(){
  const content = "// Fichier généré depuis le Mode Édition de l'application Logistique\n" +
    "const APP_DATA = " + JSON.stringify(DATA, null, 2) + ";\n";
  const blob = new Blob([content], {type:"text/javascript"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "data.js";
  a.click();
  URL.revokeObjectURL(url);
}

function resetData(){
  if(!confirm("Réinitialiser toutes les modifications locales et revenir aux données d'origine (data.js) ?")) return;
  localStorage.removeItem("logistique_data");
  DATA = loadData();
  renderAll();
}

// =========================================================
// ORGANIGRAMME
// =========================================================
function getInitials(emp){
  const realNom = (emp.nom && !emp.nom.toLowerCase().includes("compléter") && !emp.nom.toLowerCase().includes("nommer")) ? emp.nom : "";
  const a = (emp.prenom||"?").trim()[0] || "?";
  const b = (realNom || emp.prenom.trim().split(" ")[1] || "?")[0];
  return (a+b).toUpperCase();
}

function employeCard(emp, level){
  const poste = getPoste(emp.posteId) || {intitule: emp.posteId};
  const lvl = Math.min(level, 3);
  return `<div class="org-card level-${lvl}" onclick="openEmployeDetail('${emp.id}')">
      <div class="avatar">${getInitials(emp)}</div>
      <div class="name">${emp.prenom} ${emp.nom}</div>
      <div class="role">${poste.intitule}</div>
    </div>`;
}

function buildOrgNode(emp, level){
  const children = DATA.employes.filter(e=>e.managerId===emp.id);
  let html = `<li>${employeCard(emp, level)}`;
  if(children.length>0){
    html += `<ul>${children.map(c=>buildOrgNode(c, level+1)).join("")}</ul>`;
  }
  html += `</li>`;
  return html;
}

function renderOrgChart(){
  const container = document.getElementById("orgTreeContainer");
  const roots = DATA.employes.filter(e=>!e.managerId);
  if(roots.length===0){ container.innerHTML = "<p>Aucun employé.</p>"; return; }

  container.innerHTML = `<ul class="org-tree">${roots.map(r=>buildOrgNode(r,0)).join("")}</ul>`;
}

function openEmployeDetail(empId){
  const emp = getEmploye(empId);
  if(!emp) return;
  const poste = getPoste(emp.posteId);
  const manager = emp.managerId ? getEmploye(emp.managerId) : null;
  const body = document.getElementById("employeDetailBody");
  body.innerHTML = `
    <h2>${emp.prenom} ${emp.nom}</h2>
    <p><strong>Poste :</strong> ${poste ? poste.intitule : emp.posteId}</p>
    <p><strong>Service :</strong> ${poste ? poste.service : "—"}</p>
    <p><strong>Responsable hiérarchique :</strong> ${manager ? manager.prenom+" "+manager.nom : "Aucun (sommet)"}</p>
    <p><strong>Email :</strong> ${emp.email || "—"}</p>
    <p><strong>Téléphone :</strong> ${emp.telephone || "—"}</p>
    <p><strong>Date d'entrée :</strong> ${emp.dateEntree || "—"}</p>
    ${poste ? `<button class="btn secondary" onclick="closeAllModals();switchTab('postes');openPosteDetail('${poste.id}')">Voir la fiche de poste</button>` : ""}
  `;
  const actions = document.getElementById("employeDetailActions");
  actions.innerHTML = editMode ? `
    <button class="btn" onclick="openEmployeForm('${emp.id}')">Modifier</button>
    <button class="btn danger" onclick="deleteEmploye('${emp.id}')">Supprimer</button>
  ` : "";
  openModal("employeDetailModal");
}

function deleteEmploye(empId){
  if(!confirm("Supprimer cet employé ? Les employés qui en dépendent seront rattachés à son propre manager.")) return;
  const emp = getEmploye(empId);
  DATA.employes.filter(e=>e.managerId===empId).forEach(e=> e.managerId = emp.managerId);
  DATA.employes = DATA.employes.filter(e=>e.id!==empId);
  saveData(); closeAllModals(); renderAll();
}

function openEmployeForm(empId){
  const emp = empId ? getEmploye(empId) : null;
  const body = document.getElementById("employeFormBody");
  const posteOptions = DATA.postes.map(p=>`<option value="${p.id}" ${emp&&emp.posteId===p.id?"selected":""}>${p.intitule}</option>`).join("");
  const managerOptions = `<option value="">Aucun (sommet de l'organigramme)</option>` +
    DATA.employes.filter(e=>!emp || e.id!==emp.id).map(e=>`<option value="${e.id}" ${emp&&emp.managerId===e.id?"selected":""}>${e.prenom} ${e.nom}</option>`).join("");

  body.innerHTML = `
    <h2>${emp ? "Modifier" : "Ajouter"} un employé</h2>
    <div class="field-row"><label>Prénom</label><input id="f_prenom" value="${emp?emp.prenom:""}"></div>
    <div class="field-row"><label>Nom</label><input id="f_nom" value="${emp?emp.nom:""}"></div>
    <div class="field-row"><label>Poste</label><select id="f_poste">${posteOptions}</select></div>
    <div class="field-row"><label>Responsable hiérarchique</label><select id="f_manager">${managerOptions}</select></div>
    <div class="field-row"><label>Email</label><input id="f_email" value="${emp?emp.email:""}"></div>
    <div class="field-row"><label>Téléphone</label><input id="f_tel" value="${emp?emp.telephone:""}"></div>
    <div class="field-row"><label>Date d'entrée</label><input id="f_date" type="date" value="${emp?emp.dateEntree:""}"></div>
    <div class="modal-actions">
      <button class="btn" onclick="saveEmployeForm('${empId||""}')">Enregistrer</button>
      <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
    </div>
  `;
  openModal("employeFormModal");
}

function saveEmployeForm(empId){
  const data = {
    prenom: document.getElementById("f_prenom").value.trim(),
    nom: document.getElementById("f_nom").value.trim(),
    posteId: document.getElementById("f_poste").value,
    managerId: document.getElementById("f_manager").value || null,
    email: document.getElementById("f_email").value.trim(),
    telephone: document.getElementById("f_tel").value.trim(),
    dateEntree: document.getElementById("f_date").value,
    photoUrl: ""
  };
  if(empId){
    Object.assign(getEmploye(empId), data);
  } else {
    data.id = "emp_" + Date.now();
    DATA.employes.push(data);
  }
  saveData(); closeAllModals(); renderAll();
}

// =========================================================
// FICHES DE POSTE
// =========================================================
function renderPostes(){
  const q = (document.getElementById("posteSearch").value||"").toLowerCase();
  const grid = document.getElementById("postesGrid");
  const list = DATA.postes.filter(p=> p.intitule.toLowerCase().includes(q) || p.service.toLowerCase().includes(q));
  grid.innerHTML = list.map(p=>`
    <div class="card" onclick="openPosteDetail('${p.id}')">
      <h3>${p.intitule}</h3>
      <p>${p.missionPrincipale}</p>
      <span class="tag">${p.service}</span>
    </div>
  `).join("") || "<p>Aucun poste trouvé.</p>";
}

function openPosteDetail(posteId){
  const p = getPoste(posteId);
  if(!p) return;
  const titulaires = DATA.employes.filter(e=>e.posteId===posteId);
  const body = document.getElementById("posteDetailBody");
  body.innerHTML = `
    <h2>${p.intitule}</h2>
    <p class="tag">${p.service}</p>
    <p><strong>Mission principale :</strong> ${p.missionPrincipale}</p>
    <p><strong>Missions détaillées :</strong></p>
    <ul>${(p.missionsDetaillees||[]).map(m=>`<li>${m}</li>`).join("")}</ul>
    <p><strong>Compétences requises :</strong> ${(p.competencesRequises||[]).join(", ")}</p>
    <p><strong>Diplôme requis :</strong> ${p.diplomeRequis||"—"}</p>
    <p><strong>Expérience requise :</strong> ${p.experienceRequise||"—"}</p>
    <p><strong>Titulaire(s) actuel(s) :</strong> ${titulaires.length? titulaires.map(t=>t.prenom+" "+t.nom).join(", ") : "Aucun"}</p>
  `;
  const actions = document.getElementById("posteDetailActions");
  actions.innerHTML = `
    <button class="btn secondary" onclick="window.print()">Imprimer / Exporter en PDF</button>
    ${editMode ? `<button class="btn" onclick="openPosteForm('${p.id}')">Modifier</button>
    <button class="btn danger" onclick="deletePoste('${p.id}')">Supprimer</button>` : ""}
  `;
  openModal("posteDetailModal");
}

function deletePoste(posteId){
  if(!confirm("Supprimer cette fiche de poste ?")) return;
  DATA.postes = DATA.postes.filter(p=>p.id!==posteId);
  saveData(); closeAllModals(); renderAll();
}

function openPosteForm(posteId){
  const p = posteId ? getPoste(posteId) : null;
  const body = document.getElementById("posteFormBody");
  body.innerHTML = `
    <h2>${p ? "Modifier" : "Créer"} une fiche de poste</h2>
    <div class="field-row"><label>Intitulé du poste</label><input id="pf_intitule" value="${p?p.intitule:""}"></div>
    <div class="field-row"><label>Service</label><input id="pf_service" value="${p?p.service:""}"></div>
    <div class="field-row"><label>Mission principale</label><textarea id="pf_mission">${p?p.missionPrincipale:""}</textarea></div>
    <div class="field-row"><label>Missions détaillées (une par ligne)</label><textarea id="pf_missions_det">${p?(p.missionsDetaillees||[]).join("\n"):""}</textarea></div>
    <div class="field-row"><label>Compétences requises (séparées par des virgules)</label><input id="pf_competences" value="${p?(p.competencesRequises||[]).join(", "):""}"></div>
    <div class="field-row"><label>Diplôme requis</label><input id="pf_diplome" value="${p?p.diplomeRequis:""}"></div>
    <div class="field-row"><label>Expérience requise</label><input id="pf_experience" value="${p?p.experienceRequise:""}"></div>
    <div class="modal-actions">
      <button class="btn" onclick="savePosteForm('${posteId||""}')">Enregistrer</button>
      <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
    </div>
  `;
  openModal("posteFormModal");
}

function savePosteForm(posteId){
  const data = {
    intitule: document.getElementById("pf_intitule").value.trim(),
    service: document.getElementById("pf_service").value.trim(),
    missionPrincipale: document.getElementById("pf_mission").value.trim(),
    missionsDetaillees: document.getElementById("pf_missions_det").value.split("\n").map(s=>s.trim()).filter(Boolean),
    competencesRequises: document.getElementById("pf_competences").value.split(",").map(s=>s.trim()).filter(Boolean),
    diplomeRequis: document.getElementById("pf_diplome").value.trim(),
    experienceRequise: document.getElementById("pf_experience").value.trim()
  };
  if(posteId){
    Object.assign(getPoste(posteId), data);
  } else {
    data.id = "poste_" + Date.now();
    DATA.postes.push(data);
  }
  saveData(); closeAllModals(); renderAll();
}

// =========================================================
// FICHES DE FONCTION
// =========================================================
function renderFonctions(){
  const q = (document.getElementById("fonctionSearch").value||"").toLowerCase();
  const grid = document.getElementById("fonctionsGrid");
  const list = DATA.fonctions.filter(f=> f.nom.toLowerCase().includes(q));
  grid.innerHTML = list.map(f=>`
    <div class="card" onclick="openFonctionDetail('${f.id}')">
      <h3>${f.nom}</h3>
      <p>${f.objectif}</p>
    </div>
  `).join("") || "<p>Aucune fonction trouvée.</p>";
}

function openFonctionDetail(fonctionId){
  const f = getFonction(fonctionId);
  if(!f) return;
  const postesAssocies = (f.postesAssocies||[]).map(id=>getPoste(id)).filter(Boolean);
  const body = document.getElementById("fonctionDetailBody");
  body.innerHTML = `
    <h2>${f.nom}</h2>
    <p><strong>Objectif :</strong> ${f.objectif}</p>
    <p><strong>Activités principales :</strong></p>
    <ul>${(f.activitesPrincipales||[]).map(a=>`<li>${a}</li>`).join("")}</ul>
    <p><strong>Indicateurs de performance :</strong> ${(f.indicateursPerformance||[]).join(", ")}</p>
    <p><strong>Postes associés :</strong> ${postesAssocies.map(p=>p.intitule).join(", ") || "—"}</p>
  `;
  const actions = document.getElementById("fonctionDetailActions");
  actions.innerHTML = `
    <button class="btn secondary" onclick="window.print()">Imprimer / Exporter en PDF</button>
    ${editMode ? `<button class="btn" onclick="openFonctionForm('${f.id}')">Modifier</button>
    <button class="btn danger" onclick="deleteFonction('${f.id}')">Supprimer</button>` : ""}
  `;
  openModal("fonctionDetailModal");
}

function deleteFonction(fonctionId){
  if(!confirm("Supprimer cette fiche de fonction ?")) return;
  DATA.fonctions = DATA.fonctions.filter(f=>f.id!==fonctionId);
  saveData(); closeAllModals(); renderAll();
}

function openFonctionForm(fonctionId){
  const f = fonctionId ? getFonction(fonctionId) : null;
  const body = document.getElementById("fonctionFormBody");
  const posteCheckboxes = DATA.postes.map(p=>`
    <label style="display:block;font-size:.85rem;margin:4px 0;">
      <input type="checkbox" value="${p.id}" ${f && (f.postesAssocies||[]).includes(p.id) ? "checked":""}> ${p.intitule}
    </label>`).join("");

  body.innerHTML = `
    <h2>${f ? "Modifier" : "Créer"} une fiche de fonction</h2>
    <div class="field-row"><label>Nom de la fonction</label><input id="ff_nom" value="${f?f.nom:""}"></div>
    <div class="field-row"><label>Objectif</label><textarea id="ff_objectif">${f?f.objectif:""}</textarea></div>
    <div class="field-row"><label>Activités principales (une par ligne)</label><textarea id="ff_activites">${f?(f.activitesPrincipales||[]).join("\n"):""}</textarea></div>
    <div class="field-row"><label>Indicateurs de performance (séparés par des virgules)</label><input id="ff_indicateurs" value="${f?(f.indicateursPerformance||[]).join(", "):""}"></div>
    <div class="field-row"><label>Postes associés</label>${posteCheckboxes}</div>
    <div class="modal-actions">
      <button class="btn" onclick="saveFonctionForm('${fonctionId||""}')">Enregistrer</button>
      <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
    </div>
  `;
  openModal("fonctionFormModal");
}

function saveFonctionForm(fonctionId){
  const checked = Array.from(document.querySelectorAll("#fonctionFormBody input[type=checkbox]:checked")).map(c=>c.value);
  const data = {
    nom: document.getElementById("ff_nom").value.trim(),
    objectif: document.getElementById("ff_objectif").value.trim(),
    activitesPrincipales: document.getElementById("ff_activites").value.split("\n").map(s=>s.trim()).filter(Boolean),
    indicateursPerformance: document.getElementById("ff_indicateurs").value.split(",").map(s=>s.trim()).filter(Boolean),
    postesAssocies: checked
  };
  if(fonctionId){
    Object.assign(getFonction(fonctionId), data);
  } else {
    data.id = "fonction_" + Date.now();
    DATA.fonctions.push(data);
  }
  saveData(); closeAllModals(); renderAll();
}

// =========================================================
// MODALS
// =========================================================
function openModal(id){ document.getElementById(id).classList.add("open"); }
function closeAllModals(){ document.querySelectorAll(".modal-overlay").forEach(o=>o.classList.remove("open")); }
