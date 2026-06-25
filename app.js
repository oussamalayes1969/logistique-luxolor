// =========================================================
// LOGIQUE DE L'APPLICATION
// =========================================================

// On charge les données : si une version modifiée existe dans le
// navigateur (mode édition), on l'utilise ; sinon celle de data.js
let DATA = loadData();
let editMode = false;
let currentTheme = 'blue';
let oc = null;

function loadData(){
  const saved = localStorage.getItem("logistique_data");
  if(saved){
    try{
      const parsed = JSON.parse(saved);
      if(!parsed.societes)     parsed.societes     = APP_DATA.societes;
      if(!parsed.departements) parsed.departements = APP_DATA.departements;
      // Migration : ajouter societeId aux départements existants
      parsed.departements.forEach(d=>{ if(!d.societeId) d.societeId = "soc_luxolor"; });
      return parsed;
    }catch(e){ console.warn("Données locales invalides, fallback sur data.js"); }
  }
  return JSON.parse(JSON.stringify(APP_DATA));
}

function saveData(){
  localStorage.setItem("logistique_data", JSON.stringify(DATA));
}

// ─── Getters globaux ───
function getPoste(id){ return DATA.postes.find(p=>p.id===id); }
function getEmploye(id){ return DATA.employes.find(e=>e.id===id); }
function getFonction(id){ return DATA.fonctions.find(f=>f.id===id); }
function getDept(id)    { return (DATA.departements||[]).find(d=>d.id===id); }
function getSociete(id) { return (DATA.societes||[]).find(s=>s.id===id); }

// ─── Filtres par société puis département ───
function socDepts()     { return (DATA.departements||[]).filter(d=>(!d.societeId)||d.societeId===currentSocieteId); }
function deptPostes()   { return DATA.postes.filter(p=>(!p.deptId)||p.deptId===currentDeptId); }
function deptEmployes() { return DATA.employes.filter(e=>(!e.deptId)||e.deptId===currentDeptId); }
function deptFonctions(){ return DATA.fonctions.filter(f=>(!f.deptId)||f.deptId===currentDeptId); }

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

  renderSocieteBar();
  renderDeptBar();
  renderAll();
});

// =========================================================
// SOCIÉTÉS
// =========================================================
function renderSocieteBar(){
  const societes = DATA.societes || [];
  const bar = document.getElementById("societeBar");
  if(!bar) return;
  bar.innerHTML = `<span class="bar-label">Société :</span>` +
    societes.map(s=>`
      <button class="soc-btn ${s.id===currentSocieteId?'active':''}"
        onclick="switchSociete('${s.id}')"
        style="${s.id===currentSocieteId?`background:${s.couleur||'#1d4ed8'};color:#fff;border-color:${s.couleur||'#1d4ed8'}`:''}">
        ${s.icone||'🏢'} ${s.nom}
      </button>
    `).join('') +
    (editMode ? `<button class="soc-btn add-soc" onclick="openSocieteForm(null)">+ Société</button>` : '');
}

function switchSociete(socId){
  currentSocieteId = socId;
  // Sélectionner automatiquement le premier département de cette société
  const depts = socDepts();
  currentDeptId = depts.length ? depts[0].id : null;
  updateHeader();
  renderSocieteBar();
  renderDeptBar();
  renderAll();
}

function updateHeader(){
  const soc  = getSociete(currentSocieteId);
  const dept = getDept(currentDeptId);
  const h1   = document.querySelector('header h1');
  const sub  = document.querySelector('header .sub');
  if(h1)  h1.textContent  = `🏢 ${soc ? soc.nom : 'Plateforme'} — Gestion des Départements`;
  if(sub) sub.textContent = dept ? `${dept.icone||''} ${dept.nom}${dept.description?' · '+dept.description:''}` : '';
}

function openSocieteForm(socId){
  const soc = socId ? getSociete(socId) : null;
  const body = document.getElementById("employeFormBody");
  body.innerHTML = `
    <h2>${soc?'Modifier':'Créer'} une société</h2>
    <div class="field-row"><label>Nom *</label>
      <input id="sf_nom" value="${soc?soc.nom:''}" placeholder="Ex: Luxolor, Filiale Sud..."></div>
    <div class="field-row"><label>Icône (emoji)</label>
      <input id="sf_icone" value="${soc?soc.icone:'🏢'}" style="width:80px;font-size:1.4rem;text-align:center"></div>
    <div class="field-row"><label>Couleur</label>
      <input id="sf_couleur" type="color" value="${soc?soc.couleur:'#1d4ed8'}" style="width:60px;height:36px;cursor:pointer"></div>
    <div class="field-row"><label>Secteur d'activité</label>
      <input id="sf_secteur" value="${soc?soc.secteur||'':''}" placeholder="Ex: Distribution, Industrie, Services..."></div>
    <div class="modal-actions">
      <button class="btn" onclick="saveSocieteForm('${socId||''}')">Enregistrer</button>
      <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
      ${socId && DATA.societes.length>1 ? `<button class="btn danger" onclick="deleteSociete('${socId}')">Supprimer</button>` : ''}
    </div>
  `;
  openModal("employeFormModal");
}

function saveSocieteForm(socId){
  if(!DATA.societes) DATA.societes = [];
  const data = {
    nom:     document.getElementById("sf_nom").value.trim(),
    icone:   document.getElementById("sf_icone").value.trim(),
    couleur: document.getElementById("sf_couleur").value,
    secteur: document.getElementById("sf_secteur").value.trim()
  };
  if(!data.nom){ alert("Le nom est obligatoire."); return; }
  if(socId){
    Object.assign(getSociete(socId), data);
  } else {
    data.id = "soc_" + Date.now();
    DATA.societes.push(data);
    currentSocieteId = data.id;
    currentDeptId = null;
  }
  saveData(); closeAllModals(); renderSocieteBar(); updateHeader(); renderDeptBar(); renderAll();
}

function deleteSociete(socId){
  if(!confirm("Supprimer cette société ? Ses départements et données resteront mais ne seront plus accessibles.")) return;
  DATA.societes = DATA.societes.filter(s=>s.id!==socId);
  currentSocieteId = DATA.societes[0]?.id;
  const depts = socDepts();
  currentDeptId = depts[0]?.id || null;
  saveData(); closeAllModals(); renderSocieteBar(); updateHeader(); renderDeptBar(); renderAll();
}

// =========================================================
// DÉPARTEMENTS
// =========================================================
function renderDeptBar(){
  const depts = socDepts();
  const bar = document.getElementById("deptBar");
  if(!bar) return;
  bar.innerHTML = `<span class="bar-label">Département :</span>` +
    depts.map(d=>`
      <button class="dept-btn ${d.id===currentDeptId?'active':''}"
        onclick="switchDept('${d.id}')"
        style="${d.id===currentDeptId?`background:${d.couleur||'#1d4ed8'};color:#fff;border-color:${d.couleur||'#1d4ed8'}`:''}">
        ${d.icone||'🏢'} ${d.nom}
      </button>
    `).join('') +
    (editMode ? `<button class="dept-btn add-dept" onclick="openDeptForm(null)">+ Département</button>` : '');
}

function switchDept(deptId){
  currentDeptId = deptId;
  updateHeader();
  renderDeptBar();
  renderAll();
}

function openDeptForm(deptId){
  const dept = deptId ? getDept(deptId) : null;
  const body = document.getElementById("employeFormBody");
  body.innerHTML = `
    <h2>${dept?'Modifier':'Créer'} un département</h2>
    <div class="field-row"><label>Nom *</label>
      <input id="df_nom" value="${dept?dept.nom:''}" placeholder="Ex: Commercial, RH, Marketing..."></div>
    <div class="field-row"><label>Icône (emoji)</label>
      <input id="df_icone" value="${dept?dept.icone:'🏢'}" style="width:80px;font-size:1.4rem;text-align:center"></div>
    <div class="field-row"><label>Couleur</label>
      <input id="df_couleur" type="color" value="${dept?dept.couleur:'#1d4ed8'}" style="width:60px;height:36px;cursor:pointer"></div>
    <div class="field-row"><label>Description</label>
      <input id="df_desc" value="${dept?dept.description||'':''}" placeholder="Ex: Équipe ventes France"></div>
    <div class="modal-actions">
      <button class="btn" onclick="saveDeptForm('${deptId||''}')">Enregistrer</button>
      <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
      ${deptId && DATA.departements.length>1 ? `<button class="btn danger" onclick="deleteDept('${deptId}')">Supprimer</button>` : ''}
    </div>
  `;
  openModal("employeFormModal");
}

function saveDeptForm(deptId){
  if(!DATA.departements) DATA.departements = [];
  const data = {
    nom:         document.getElementById("df_nom").value.trim(),
    icone:       document.getElementById("df_icone").value.trim(),
    couleur:     document.getElementById("df_couleur").value,
    description: document.getElementById("df_desc").value.trim()
  };
  if(!data.nom){ alert("Le nom est obligatoire."); return; }
  if(deptId){
    Object.assign(getDept(deptId), data);
  } else {
    data.id = "dept_" + Date.now();
    data.societeId = currentSocieteId;
    DATA.departements.push(data);
    currentDeptId = data.id;
  }
  saveData(); closeAllModals(); updateHeader(); renderDeptBar(); renderAll();
}

function deleteDept(deptId){
  if(!confirm("Supprimer ce département ? Ses données resteront mais ne seront plus accessibles via ce département.")) return;
  DATA.departements = DATA.departements.filter(d=>d.id!==deptId);
  currentDeptId = DATA.departements[0]?.id || "dept_logistique";
  saveData(); closeAllModals(); renderDeptBar(); renderAll();
}

function switchTab(tab){
  document.querySelectorAll("nav.tabs button").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active", p.id===tab));
}

function renderAll(){
  try{ renderOrgChart(); } catch(e){ console.error("OrgChart error:", e); }
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
  document.getElementById("editHint").style.display = editMode ? "inline" : "none";
  renderDeptBar();
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

const THEMES = {
  blue:   { c0:'#1d4ed8', c1:'#3b82f6', c2:'#bfdbfe', t2:'#1e3a8a' },
  green:  { c0:'#15803d', c1:'#22c55e', c2:'#bbf7d0', t2:'#14532d' },
  purple: { c0:'#6d28d9', c1:'#a855f7', c2:'#e9d5ff', t2:'#4c1d95' },
  orange: { c0:'#c2410c', c1:'#f97316', c2:'#fed7aa', t2:'#7c2d12' },
  dark:   { c0:'#0f172a', c1:'#334155', c2:'#475569', t2:'#f1f5f9' }
};

function empCard(emp, level){
  const poste = getPoste(emp.posteId) || {intitule:''};
  const th = THEMES[currentTheme] || THEMES.blue;
  const bg  = level===0 ? th.c0 : level===1 ? th.c1 : th.c2;
  const clr = level<=1 ? '#fff' : th.t2;
  const dim = level===0 ? '' : level===1 ? '' : 'opacity:.82;';
  const nom = emp.prenom + ' ' + emp.nom;
  const placeholder = nom.includes('compléter')||nom.includes('nommer');
  const score = perfScore(emp.objectifs||[]);
  const charge = chargeScore(emp.planning||[]);
  const dots = `
    ${score ? `<span class="ind-dot" style="background:${score==='green'?'#22c55e':score==='red'?'#ef4444':'#f59e0b'}" title="Objectifs : ${score==='green'?'atteints':score==='red'?'en difficulté':'en cours'}"></span>` : ''}
    ${charge ? `<span class="ind-dot" style="background:${charge==='red'?'#ef4444':charge==='orange'?'#f59e0b':'#3b82f6'}" title="Charge : ${charge==='red'?'élevée':charge==='orange'?'modérée':'légère'}"></span>` : ''}
  `;
  return `<div class="ec lv${level}" data-id="${emp.id}"
    style="background:${bg};color:${clr};${dim}position:relative;"
    onclick="cardClick('${emp.id}')"
    ondblclick="openEmployeForm('${emp.id}')">
    <div class="ind-dots">${dots}</div>
    <div class="ec-n">${placeholder?'<em>'+emp.prenom+'</em>':nom}</div>
    <div class="ec-r" style="color:${level<=1?'rgba(255,255,255,.8)':th.t2+'99'}">${poste.intitule}</div>
  </div>`;
}

function cardClick(id){
  openEmployeDetail(id);
}

function vline(h){ return `<div style="width:2px;height:${h}px;background:#94a3b8;margin:0 auto;"></div>`; }
function hline(){ return `<div style="height:2px;background:#94a3b8;position:absolute;top:0;left:50%;right:50%;width:calc(100% - 80px);transform:translateX(-50%);"></div>`; }

function renderOrgChart(){
  if(window._oc && window._oc.deptId !== currentDeptId){
    window._oc.destroy();
    window._oc = null;
  }
  const wrap = document.getElementById('orgTreeContainer');
  wrap.innerHTML = '';
  window._oc = new OrgCanvas('orgTreeContainer', currentDeptId, !editMode);
}

function setOrgTheme(theme, btn){
  currentTheme = theme;
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderOrgChart();
}

function isDescendantOf(targetId, ancestorId){
  let cur = getEmploye(targetId);
  while(cur && cur.managerId){
    if(cur.managerId === ancestorId) return true;
    cur = getEmploye(cur.managerId);
  }
  return false;
}

// =========================================================
// OBJECTIFS — helpers
// =========================================================
function getObjectifs(empId){ return (getEmploye(empId)||{}).objectifs || []; }

function perfScore(objectifs){
  if(!objectifs.length) return null;
  const atteints = objectifs.filter(o=>o.statut==='atteint').length;
  const nonAtteints = objectifs.filter(o=>o.statut==='non_atteint').length;
  if(atteints === objectifs.length) return 'green';
  if(nonAtteints > 0) return 'red';
  return 'orange';
}

function statutLabel(s){
  return s==='atteint'?'✅ Atteint':s==='non_atteint'?'❌ Non atteint':'🔄 En cours';
}

function progressBar(pct){
  const p = Math.min(100, Math.max(0, pct||0));
  const c = p>=100?'#16a34a':p>=60?'#f59e0b':'#dc2626';
  return `<div style="background:#e2e8f0;border-radius:99px;height:8px;width:100%;margin-top:4px">
    <div style="width:${p}%;background:${c};height:8px;border-radius:99px;transition:width .4s"></div>
  </div><div style="font-size:.7rem;color:#64748b;margin-top:2px">${p}%</div>`;
}

function renderObjectifsSection(empId){
  const objectifs = getObjectifs(empId);
  if(!objectifs.length) return `
    <div style="color:#64748b;font-size:.85rem;padding:12px 0;">Aucun objectif défini pour cet employé.</div>
    ${editMode?`<button class="btn" style="margin-top:8px" onclick="openObjForm('${empId}',null)">+ Ajouter un objectif</button>`:''}
  `;
  const rows = objectifs.map(o=>`
    <div class="obj-card" style="border-left:4px solid ${o.statut==='atteint'?'#16a34a':o.statut==='non_atteint'?'#dc2626':'#f59e0b'}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <div style="font-weight:700;font-size:.88rem">${o.titre}</div>
          <div style="font-size:.75rem;color:#64748b;margin-top:2px">${o.indicateur||''} ${o.echeance?'· Échéance : '+o.echeance:''}</div>
        </div>
        <span class="obj-badge" style="background:${o.statut==='atteint'?'#dcfce7':o.statut==='non_atteint'?'#fee2e2':'#fef9c3'};color:${o.statut==='atteint'?'#15803d':o.statut==='non_atteint'?'#b91c1c':'#92400e'}">${statutLabel(o.statut)}</span>
      </div>
      ${progressBar(o.avancement)}
      ${o.description?`<div style="font-size:.78rem;color:#475569;margin-top:6px">${o.description}</div>`:''}
      ${editMode?`<div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn secondary" style="font-size:.75rem;padding:4px 10px" onclick="openObjForm('${empId}','${o.id}')">Modifier</button>
        <button class="btn danger" style="font-size:.75rem;padding:4px 10px" onclick="deleteObj('${empId}','${o.id}')">Supprimer</button>
      </div>`:''}
    </div>
  `).join('');
  return `<div style="display:flex;flex-direction:column;gap:10px">${rows}</div>
    ${editMode?`<button class="btn" style="margin-top:12px" onclick="openObjForm('${empId}',null)">+ Ajouter un objectif</button>`:''}`;
}

// =========================================================
// FICHE EMPLOYÉ — avec onglets Info / Objectifs
// =========================================================
function openEmployeDetail(empId){
  const emp = getEmploye(empId);
  if(!emp) return;
  const poste = getPoste(emp.posteId);
  const manager = emp.managerId ? getEmploye(emp.managerId) : null;
  const score = perfScore(getObjectifs(empId));
  const scoreBadge = score
    ? `<span style="display:inline-block;margin-left:8px;padding:2px 10px;border-radius:99px;font-size:.75rem;font-weight:700;background:${score==='green'?'#dcfce7':score==='red'?'#fee2e2':'#fef9c3'};color:${score==='green'?'#15803d':score==='red'?'#b91c1c':'#92400e'}">${score==='green'?'✅ Objectifs atteints':score==='red'?'⚠ Objectifs en difficulté':'🔄 En cours'}</span>`
    : '';

  const body = document.getElementById("employeDetailBody");
  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <h2 style="margin:0">${emp.prenom} ${emp.nom}</h2>${scoreBadge}
    </div>

    <!-- Onglets -->
    <div class="detail-tabs">
      <button class="dtab active" onclick="switchDetailTab('info','${empId}',this)">Informations</button>
      <button class="dtab" onclick="switchDetailTab('objectifs','${empId}',this)">Objectifs (${getObjectifs(empId).length})</button>
      <button class="dtab" onclick="switchDetailTab('planning','${empId}',this)">Planning (${getTaches(empId).length})</button>
    </div>

    <!-- Panneau Info -->
    <div id="dtab-info" class="dtab-panel">
      <p><strong>Poste :</strong> ${poste ? poste.intitule : emp.posteId}</p>
      <p><strong>Service :</strong> ${poste ? poste.service : "—"}</p>
      <p><strong>Responsable :</strong> ${manager ? manager.prenom+" "+manager.nom : "Aucun (sommet)"}</p>
      <p><strong>Email :</strong> ${emp.email || "—"}</p>
      <p><strong>Téléphone :</strong> ${emp.telephone || "—"}</p>
      <p><strong>Date d'entrée :</strong> ${emp.dateEntree || "—"}</p>
      ${poste ? `<button class="btn secondary" style="margin-top:8px" onclick="closeAllModals();switchTab('postes');openPosteDetail('${poste.id}')">Voir la fiche de poste</button>` : ""}
    </div>

    <!-- Panneau Objectifs -->
    <div id="dtab-objectifs" class="dtab-panel" style="display:none">
      ${renderObjectifsSection(empId)}
    </div>

    <!-- Panneau Planning -->
    <div id="dtab-planning" class="dtab-panel" style="display:none">
      ${renderPlanningSection(empId)}
    </div>
  `;
  const actions = document.getElementById("employeDetailActions");
  actions.innerHTML = editMode ? `
    <button class="btn" onclick="openEmployeForm('${emp.id}')">Modifier les infos</button>
    <button class="btn danger" onclick="deleteEmploye('${emp.id}')">Supprimer</button>
  ` : "";
  openModal("employeDetailModal");
}

function switchDetailTab(tab, empId, btn){
  document.querySelectorAll('.dtab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.dtab-panel').forEach(p=>p.style.display='none');
  document.getElementById('dtab-'+tab).style.display='block';
}

// =========================================================
// PLANNING — helpers
// =========================================================
function getTaches(empId){ return (getEmploye(empId)||{}).planning || []; }

function chargeScore(taches){
  const actives = taches.filter(t => t.statut !== 'termine').length;
  if(!actives) return null;
  if(actives >= 5) return 'red';
  if(actives >= 3) return 'orange';
  return 'blue';
}

function tacheStatutLabel(s){
  return s==='termine'?'✅ Terminé':s==='en_cours'?'🔄 En cours':'📋 À faire';
}

function prioriteLabel(p){
  return p==='haute'?'🔴 Haute':p==='normale'?'🟡 Normale':'🟢 Basse';
}

function joursRestants(dateFin){
  if(!dateFin) return null;
  const diff = Math.ceil((new Date(dateFin) - new Date()) / 86400000);
  if(diff < 0) return `<span style="color:#dc2626;font-weight:700">⚠ En retard de ${Math.abs(diff)} j</span>`;
  if(diff === 0) return `<span style="color:#f59e0b;font-weight:700">Échéance aujourd'hui</span>`;
  if(diff <= 3) return `<span style="color:#f59e0b">J-${diff}</span>`;
  return `<span style="color:#64748b">J-${diff}</span>`;
}

function renderPlanningSection(empId){
  const taches = getTaches(empId);
  const actives = taches.filter(t=>t.statut!=='termine').length;
  const terminees = taches.filter(t=>t.statut==='termine').length;

  if(!taches.length) return `
    <div style="color:#64748b;font-size:.85rem;padding:12px 0;">Aucune tâche planifiée pour cet employé.</div>
    ${editMode?`<button class="btn" style="margin-top:8px" onclick="openTacheForm('${empId}',null)">+ Ajouter une tâche</button>`:''}
  `;

  // Résumé charge
  const chargePct = Math.min(100, actives * 20);
  const chargeClr = actives>=5?'#dc2626':actives>=3?'#f59e0b':'#16a34a';
  const resume = `<div class="planning-resume">
    <div class="pr-stat"><div style="font-size:1.4rem;font-weight:800;color:${chargeClr}">${actives}</div><div>tâches actives</div></div>
    <div class="pr-stat"><div style="font-size:1.4rem;font-weight:800;color:#16a34a">${terminees}</div><div>terminées</div></div>
    <div class="pr-stat" style="flex:1">
      <div style="font-size:.75rem;color:#64748b;margin-bottom:4px">Charge estimée</div>
      <div style="background:#e2e8f0;border-radius:99px;height:10px">
        <div style="width:${chargePct}%;background:${chargeClr};height:10px;border-radius:99px;transition:width .4s"></div>
      </div>
      <div style="font-size:.7rem;color:#64748b;margin-top:2px">${chargePct}%</div>
    </div>
  </div>`;

  // Trier : actives d'abord (par priorité), terminées en bas
  const ordre = {haute:0,normale:1,basse:2};
  const sorted = [...taches].sort((a,b)=>{
    if(a.statut==='termine' && b.statut!=='termine') return 1;
    if(b.statut==='termine' && a.statut!=='termine') return -1;
    return (ordre[a.priorite]||1) - (ordre[b.priorite]||1);
  });

  const rows = sorted.map(t=>{
    const borderClr = t.statut==='termine'?'#94a3b8':t.priorite==='haute'?'#dc2626':t.priorite==='normale'?'#f59e0b':'#22c55e';
    const bgCard = t.statut==='termine'?'#f1f5f9':'#f8fafc';
    return `<div class="tache-card" style="border-left:4px solid ${borderClr};background:${bgCard};opacity:${t.statut==='termine'?.6:1}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="flex:1">
          <div style="font-weight:700;font-size:.88rem;${t.statut==='termine'?'text-decoration:line-through;color:#94a3b8':''}">${t.titre}</div>
          <div style="font-size:.72rem;color:#64748b;margin-top:2px;display:flex;gap:10px;flex-wrap:wrap">
            <span>${tacheStatutLabel(t.statut)}</span>
            <span>${prioriteLabel(t.priorite)}</span>
            ${t.dateDebut?`<span>Du ${t.dateDebut}</span>`:''}
            ${t.dateFin?`<span>au ${t.dateFin}</span> ${joursRestants(t.dateFin)}`:''}
          </div>
          ${t.description?`<div style="font-size:.78rem;color:#475569;margin-top:5px">${t.description}</div>`:''}
        </div>
      </div>
      ${editMode?`<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        ${t.statut!=='termine'?`<button class="btn secondary" style="font-size:.72rem;padding:3px 9px" onclick="marquerTerminee('${empId}','${t.id}')">✅ Terminer</button>`:''}
        <button class="btn secondary" style="font-size:.72rem;padding:3px 9px" onclick="openTacheForm('${empId}','${t.id}')">Modifier</button>
        <button class="btn danger" style="font-size:.72rem;padding:3px 9px" onclick="deleteTache('${empId}','${t.id}')">Supprimer</button>
      </div>`:''}
    </div>`;
  }).join('');

  return `${resume}<div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">${rows}</div>
    ${editMode?`<button class="btn" style="margin-top:12px" onclick="openTacheForm('${empId}',null)">+ Ajouter une tâche</button>`:''}`;
}

// =========================================================
// CRUD PLANNING
// =========================================================
function openTacheForm(empId, tacheId){
  const emp = getEmploye(empId);
  const t = tacheId ? (emp.planning||[]).find(x=>x.id===tacheId) : null;
  const body = document.getElementById("employeFormBody");
  body.innerHTML = `
    <h2>${t?'Modifier':'Ajouter'} une tâche — ${emp.prenom} ${emp.nom}</h2>
    <div class="field-row"><label>Titre de la tâche *</label>
      <input id="tf_titre" value="${t?t.titre:''}" placeholder="Ex : Préparation inventaire mensuel"></div>
    <div class="field-row"><label>Description</label>
      <textarea id="tf_desc" placeholder="Détails, contexte...">${t?t.description:''}</textarea></div>
    <div class="field-row"><label>Priorité</label>
      <select id="tf_prio">
        <option value="haute" ${t&&t.priorite==='haute'?'selected':''}>🔴 Haute</option>
        <option value="normale" ${!t||t.priorite==='normale'?'selected':''}>🟡 Normale</option>
        <option value="basse" ${t&&t.priorite==='basse'?'selected':''}>🟢 Basse</option>
      </select></div>
    <div class="field-row"><label>Statut</label>
      <select id="tf_statut">
        <option value="a_faire" ${!t||t.statut==='a_faire'?'selected':''}>📋 À faire</option>
        <option value="en_cours" ${t&&t.statut==='en_cours'?'selected':''}>🔄 En cours</option>
        <option value="termine" ${t&&t.statut==='termine'?'selected':''}>✅ Terminé</option>
      </select></div>
    <div style="display:flex;gap:12px">
      <div class="field-row" style="flex:1"><label>Date de début</label>
        <input id="tf_debut" type="date" value="${t?t.dateDebut:''}"></div>
      <div class="field-row" style="flex:1"><label>Date de fin / Échéance</label>
        <input id="tf_fin" type="date" value="${t?t.dateFin:''}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="saveTacheForm('${empId}','${tacheId||''}')">Enregistrer</button>
      <button class="btn secondary" onclick="openEmployeDetail('${empId}')">Annuler</button>
    </div>
  `;
  openModal("employeFormModal");
}

function saveTacheForm(empId, tacheId){
  const emp = getEmploye(empId);
  if(!emp.planning) emp.planning = [];
  const data = {
    titre:       document.getElementById("tf_titre").value.trim(),
    description: document.getElementById("tf_desc").value.trim(),
    priorite:    document.getElementById("tf_prio").value,
    statut:      document.getElementById("tf_statut").value,
    dateDebut:   document.getElementById("tf_debut").value,
    dateFin:     document.getElementById("tf_fin").value
  };
  if(!data.titre){ alert("Le titre est obligatoire."); return; }
  if(tacheId){
    Object.assign(emp.planning.find(t=>t.id===tacheId), data);
  } else {
    data.id = "tache_" + Date.now();
    emp.planning.push(data);
  }
  saveData();
  openEmployeDetail(empId);
  setTimeout(()=>{ document.querySelector('.dtab:nth-child(3)')?.click(); }, 50);
}

function marquerTerminee(empId, tacheId){
  const emp = getEmploye(empId);
  const t = (emp.planning||[]).find(x=>x.id===tacheId);
  if(t){ t.statut='termine'; saveData(); openEmployeDetail(empId);
    setTimeout(()=>{ document.querySelector('.dtab:nth-child(3)')?.click(); }, 50); }
}

function deleteTache(empId, tacheId){
  if(!confirm("Supprimer cette tâche ?")) return;
  const emp = getEmploye(empId);
  emp.planning = (emp.planning||[]).filter(t=>t.id!==tacheId);
  saveData();
  openEmployeDetail(empId);
  setTimeout(()=>{ document.querySelector('.dtab:nth-child(3)')?.click(); }, 50);
}

// =========================================================
// CRUD OBJECTIFS
// =========================================================
function openObjForm(empId, objId){
  const emp = getEmploye(empId);
  const obj = objId ? (emp.objectifs||[]).find(o=>o.id===objId) : null;
  const body = document.getElementById("employeFormBody");
  body.innerHTML = `
    <h2>${obj?'Modifier':'Ajouter'} un objectif — ${emp.prenom} ${emp.nom}</h2>
    <div class="field-row"><label>Titre de l'objectif *</label>
      <input id="of_titre" value="${obj?obj.titre:''}" placeholder="Ex : Réduire le taux d'écart d'inventaire"></div>
    <div class="field-row"><label>Description</label>
      <textarea id="of_desc" placeholder="Contexte, détails...">${obj?obj.description:''}</textarea></div>
    <div class="field-row"><label>Indicateur / KPI</label>
      <input id="of_kpi" value="${obj?obj.indicateur:''}" placeholder="Ex : Taux d'écart < 2%"></div>
    <div class="field-row"><label>Avancement (%)</label>
      <input id="of_avanc" type="number" min="0" max="100" value="${obj?obj.avancement:0}" style="width:100px"></div>
    <div class="field-row"><label>Statut</label>
      <select id="of_statut">
        <option value="en_cours" ${!obj||obj.statut==='en_cours'?'selected':''}>🔄 En cours</option>
        <option value="atteint" ${obj&&obj.statut==='atteint'?'selected':''}>✅ Atteint</option>
        <option value="non_atteint" ${obj&&obj.statut==='non_atteint'?'selected':''}>❌ Non atteint</option>
      </select></div>
    <div class="field-row"><label>Date d'échéance</label>
      <input id="of_ech" type="date" value="${obj?obj.echeance:''}"></div>
    <div class="modal-actions">
      <button class="btn" onclick="saveObjForm('${empId}','${objId||''}')">Enregistrer</button>
      <button class="btn secondary" onclick="openEmployeDetail('${empId}')">Annuler</button>
    </div>
  `;
  openModal("employeFormModal");
}

function saveObjForm(empId, objId){
  const emp = getEmploye(empId);
  if(!emp.objectifs) emp.objectifs = [];
  const data = {
    titre:      document.getElementById("of_titre").value.trim(),
    description:document.getElementById("of_desc").value.trim(),
    indicateur: document.getElementById("of_kpi").value.trim(),
    avancement: parseInt(document.getElementById("of_avanc").value)||0,
    statut:     document.getElementById("of_statut").value,
    echeance:   document.getElementById("of_ech").value
  };
  if(!data.titre){ alert("Le titre est obligatoire."); return; }
  if(objId){
    Object.assign(emp.objectifs.find(o=>o.id===objId), data);
  } else {
    data.id = "obj_" + Date.now();
    emp.objectifs.push(data);
  }
  saveData();
  openEmployeDetail(empId);
  setTimeout(()=>{
    const btn = document.querySelector('.dtab:nth-child(2)');
    if(btn) btn.click();
  }, 50);
}

function deleteObj(empId, objId){
  if(!confirm("Supprimer cet objectif ?")) return;
  const emp = getEmploye(empId);
  emp.objectifs = (emp.objectifs||[]).filter(o=>o.id!==objId);
  saveData();
  openEmployeDetail(empId);
  setTimeout(()=>{
    const btn = document.querySelector('.dtab:nth-child(2)');
    if(btn) btn.click();
  }, 50);
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
    data.deptId = currentDeptId;
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
  const list = deptPostes().filter(p=> p.intitule.toLowerCase().includes(q) || p.service.toLowerCase().includes(q));
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
    data.deptId = currentDeptId;
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
  const list = deptFonctions().filter(f=> f.nom.toLowerCase().includes(q));
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
    data.deptId = currentDeptId;
    DATA.fonctions.push(data);
  }
  saveData(); closeAllModals(); renderAll();
}

// =========================================================
// MODALS
// =========================================================
function openModal(id){ document.getElementById(id).classList.add("open"); }
function closeAllModals(){ document.querySelectorAll(".modal-overlay").forEach(o=>o.classList.remove("open")); }
