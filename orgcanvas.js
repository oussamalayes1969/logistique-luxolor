// =========================================================
// OrgCanvas v3 — Canvas interactif sans dépendance
// Drag · Resize (CSS) · Connexions SVG · Sidebar · Templates
// =========================================================

const TEMPLATES_CONFIG = {
  standard: {
    label: 'Standard Pyramidal',
    nodes:[
      {id:'n1',x:310,y:20, w:200,h:68,label:'Directeur Général',   sub:'Direction',         bg:'#0f172a',fg:'#fff'},
      {id:'n2',x:80, y:160,w:180,h:60,label:'Dir. Opérations',     sub:'Opérations',        bg:'#1d4ed8',fg:'#fff'},
      {id:'n3',x:310,y:160,w:180,h:60,label:'Dir. Commercial',     sub:'Commercial',        bg:'#1d4ed8',fg:'#fff'},
      {id:'n4',x:540,y:160,w:180,h:60,label:'Dir. RH',             sub:'Ressources Hum.',   bg:'#1d4ed8',fg:'#fff'},
      {id:'n5',x:20, y:295,w:155,h:55,label:'Manager Op. Nord',    sub:'Zone Nord',         bg:'#bfdbfe',fg:'#1e3a8a'},
      {id:'n6',x:185,y:295,w:155,h:55,label:'Manager Op. Sud',     sub:'Zone Sud',          bg:'#bfdbfe',fg:'#1e3a8a'},
      {id:'n7',x:255,y:295,w:155,h:55,label:'Manager Com. A',      sub:'Zone A',            bg:'#bfdbfe',fg:'#1e3a8a'},
      {id:'n8',x:420,y:295,w:155,h:55,label:'Manager Com. B',      sub:'Zone B',            bg:'#bfdbfe',fg:'#1e3a8a'},
      {id:'n9',x:530,y:295,w:155,h:55,label:'Chargé Recrutement',  sub:'RH',                bg:'#bfdbfe',fg:'#1e3a8a'},
      {id:'n10',x:695,y:295,w:155,h:55,label:'Chargé Formation',   sub:'RH',                bg:'#bfdbfe',fg:'#1e3a8a'},
    ],
    edges:[
      {from:'n1',to:'n2'},{from:'n1',to:'n3'},{from:'n1',to:'n4'},
      {from:'n2',to:'n5'},{from:'n2',to:'n6'},
      {from:'n3',to:'n7'},{from:'n3',to:'n8'},
      {from:'n4',to:'n9'},{from:'n4',to:'n10'},
    ]
  },
  logistique: {
    label: 'Logistique Luxolor',
    nodes:[
      {id:'l1',x:285,y:20, w:215,h:70,label:'Directeur Logistique',  sub:'Oussama Layes',       bg:'#0f172a',fg:'#fff'},
      {id:'l2',x:15, y:165,w:185,h:62,label:'Resp. Dépôt Central',   sub:'Zied Graf',           bg:'#1d4ed8',fg:'#fff'},
      {id:'l3',x:215,y:165,w:185,h:62,label:'Resp. Vente en ligne',  sub:'À nommer',            bg:'#15803d',fg:'#fff'},
      {id:'l4',x:415,y:165,w:185,h:62,label:'Resp. Administratif',   sub:'Omar Dhamna',         bg:'#7c3aed',fg:'#fff'},
      {id:'l5',x:615,y:165,w:185,h:62,label:'Gestionnaire Stock',    sub:'Houcem Charfi',       bg:'#c2410c',fg:'#fff'},
      {id:'l6',x:15, y:300,w:175,h:52,label:'Agents Dépôt ×12',     sub:'Dépôt Central',       bg:'#bfdbfe',fg:'#1e3a8a'},
      {id:'l7',x:215,y:300,w:175,h:52,label:'Agents Vente ×7',      sub:'Vente en ligne',      bg:'#bbf7d0',fg:'#14532d'},
      {id:'l8',x:415,y:300,w:175,h:52,label:'Administratifs ×3',    sub:'Administratif',       bg:'#e9d5ff',fg:'#4c1d95'},
      {id:'l9',x:615,y:300,w:175,h:52,label:'Agents Stock ×2',      sub:'Gestion des stocks',  bg:'#fed7aa',fg:'#7c2d12'},
    ],
    edges:[
      {from:'l1',to:'l2'},{from:'l1',to:'l3'},{from:'l1',to:'l4'},{from:'l1',to:'l5'},
      {from:'l2',to:'l6'},{from:'l3',to:'l7'},{from:'l4',to:'l8'},{from:'l5',to:'l9'},
    ]
  },
  commercial: {
    label: 'Commercial & Ventes',
    nodes:[
      {id:'c1',x:270,y:20, w:200,h:68,label:'Directeur Commercial', sub:'Direction',     bg:'#c2410c',fg:'#fff'},
      {id:'c2',x:80, y:160,w:175,h:60,label:'Chef Ventes Nord',     sub:'Zone Nord',     bg:'#ea580c',fg:'#fff'},
      {id:'c3',x:390,y:160,w:175,h:60,label:'Chef Ventes Sud',      sub:'Zone Sud',      bg:'#ea580c',fg:'#fff'},
      {id:'c4',x:665,y:160,w:175,h:60,label:'Responsable ADV',      sub:'Admin. Ventes', bg:'#ea580c',fg:'#fff'},
      {id:'c5',x:20, y:290,w:155,h:52,label:'Commercial 1',         sub:'Zone Nord',     bg:'#fed7aa',fg:'#7c2d12'},
      {id:'c6',x:185,y:290,w:155,h:52,label:'Commercial 2',         sub:'Zone Nord',     bg:'#fed7aa',fg:'#7c2d12'},
      {id:'c7',x:335,y:290,w:155,h:52,label:'Commercial 3',         sub:'Zone Sud',      bg:'#fed7aa',fg:'#7c2d12'},
      {id:'c8',x:500,y:290,w:155,h:52,label:'Commercial 4',         sub:'Zone Sud',      bg:'#fed7aa',fg:'#7c2d12'},
      {id:'c9',x:665,y:290,w:155,h:52,label:'Assistante ADV',       sub:'',              bg:'#fed7aa',fg:'#7c2d12'},
    ],
    edges:[
      {from:'c1',to:'c2'},{from:'c1',to:'c3'},{from:'c1',to:'c4'},
      {from:'c2',to:'c5'},{from:'c2',to:'c6'},
      {from:'c3',to:'c7'},{from:'c3',to:'c8'},
      {from:'c4',to:'c9'},
    ]
  },
  rh: {
    label: 'Ressources Humaines',
    nodes:[
      {id:'r1',x:265,y:20, w:190,h:68,label:'DRH',                 sub:'Direction RH',   bg:'#7c3aed',fg:'#fff'},
      {id:'r2',x:50, y:155,w:175,h:60,label:'Resp. Recrutement',   sub:'Recrutement',    bg:'#8b5cf6',fg:'#fff'},
      {id:'r3',x:265,y:155,w:175,h:60,label:'Resp. Formation',     sub:'Formation',      bg:'#8b5cf6',fg:'#fff'},
      {id:'r4',x:480,y:155,w:175,h:60,label:'Resp. Paie & Admin',  sub:'Paie',           bg:'#8b5cf6',fg:'#fff'},
      {id:'r5',x:50, y:285,w:160,h:52,label:'Chargé Recrutement',  sub:'',               bg:'#e9d5ff',fg:'#4c1d95'},
      {id:'r6',x:265,y:285,w:160,h:52,label:'Chargé Formation',    sub:'',               bg:'#e9d5ff',fg:'#4c1d95'},
      {id:'r7',x:480,y:285,w:160,h:52,label:'Gestionnaire Paie',   sub:'',               bg:'#e9d5ff',fg:'#4c1d95'},
    ],
    edges:[
      {from:'r1',to:'r2'},{from:'r1',to:'r3'},{from:'r1',to:'r4'},
      {from:'r2',to:'r5'},{from:'r3',to:'r6'},{from:'r4',to:'r7'},
    ]
  }
};

// ─────────────────────────────────────────────────────────────
class OrgCanvas {

  constructor(containerId, deptId, readOnly) {
    this.p        = containerId;      // préfixe id
    this.deptId   = deptId;
    this.readOnly = !!readOnly;
    this.nodes    = [];
    this.edges    = [];
    this.sel      = null;             // id nœud sélectionné
    this._drag    = null;
    this._conn    = null;             // connexion en cours
    this._pan     = null;
    this.tx = 40; this.ty = 40; this.zoom = 1;

    this._onMv  = e => this._mouseMove(e);
    this._onUp  = e => this._mouseUp(e);
    window.addEventListener('mousemove', this._onMv);
    window.addEventListener('mouseup',   this._onUp);

    this._inject();
    this._loadData();
  }

  // ── DOM ──────────────────────────────────────────────────
  _inject() {
    const wrap = document.getElementById(this.p);
    if (!wrap) return;
    const p = this.p, ro = this.readOnly;

    wrap.innerHTML = `
      <div id="${p}T" class="oc-toolbar" style="${ro?'display:none':''}">
        <button class="btn oc-tbtn" id="${p}BAdd">＋ Nouveau rôle</button>
        <button class="btn oc-tbtn secondary" id="${p}BTpl">📋 Modèle</button>
        <button class="btn oc-tbtn" id="${p}BGen" style="background:#15803d">👥 Générer depuis les équipes</button>
        <span style="flex:1"></span>
        <button class="btn oc-tbtn secondary" id="${p}BFit">⊙ Recadrer</button>
        <button class="btn oc-tbtn secondary" id="${p}BClr">🗑 Vider</button>
        <span class="oc-hint">🖱 Glisser fond = naviguer · Molette = zoom · Maj+clic = relier · Dbl-clic = éditer</span>
      </div>
      <div class="oc-main">
        <div class="oc-stage" id="${p}S">
          <div class="oc-inner" id="${p}I">
            <svg id="${p}V" class="oc-svg" overflow="visible"
              xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="${p}Arr" markerWidth="10" markerHeight="7"
                  refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0,10 3.5,0 7" fill="#94a3b8"/>
                </marker>
              </defs>
              <g id="${p}G"></g>
            </svg>
          </div>
          <div class="oc-empty" id="${p}E">
            <div style="font-size:3rem">🏢</div>
            <h3>Organigramme vide</h3>
            <p>Créez votre premier rôle ou choisissez un modèle.</p>
            ${ro ? '' : `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;justify-content:center">
              <button class="btn" id="${p}EGen" style="background:#15803d">👥 Générer depuis les équipes</button>
              <button class="btn" id="${p}EAdd">＋ Créer un rôle</button>
              <button class="btn secondary" id="${p}ETpl">📋 Modèle</button>
            </div>`}
          </div>
        </div>
        <div class="oc-sidebar" id="${p}SB" style="display:none">
          <div class="oc-sb-header">
            <b>✏ Propriétés du nœud</b>
            <button id="${p}SBX" style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:#64748b">✕</button>
          </div>
          <div class="oc-sb-body">
            <label class="oc-sb-label">Nom / Rôle</label>
            <input class="oc-sb-input" id="${p}SBL" placeholder="Ex: Directeur Général">
            <label class="oc-sb-label">Sous-titre</label>
            <input class="oc-sb-input" id="${p}SBS" placeholder="Ex: Direction">
            <label class="oc-sb-label">Couleur de fond</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
              <input type="color" id="${p}SBC" style="width:40px;height:36px;border-radius:6px;border:1px solid #e2e8f0;cursor:pointer">
              ${['#0f172a','#1d4ed8','#15803d','#7c3aed','#c2410c','#0369a1','#be185d','#475569','#bfdbfe','#bbf7d0'].map(c =>
                `<div style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;border:2px solid rgba(0,0,0,.1)"
                  onclick="document.getElementById('${p}SBC').value='${c}'"></div>`
              ).join('')}
            </div>
            <label class="oc-sb-label">Texte</label>
            <div style="display:flex;gap:6px;margin-bottom:14px">
              <button id="${p}SBTW" style="flex:1;padding:6px;border-radius:6px;border:1px solid #e2e8f0;background:#1d4ed8;color:#fff;cursor:pointer;font-weight:600">Blanc</button>
              <button id="${p}SBTD" style="flex:1;padding:6px;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc;color:#1e293b;cursor:pointer">Sombre</button>
            </div>
            <button class="btn" id="${p}SBOk" style="width:100%;margin-bottom:8px">✓ Appliquer</button>
            <button class="btn secondary" id="${p}SBFiche" style="width:100%;margin-bottom:8px">👤 Voir fiche employé</button>
            <button class="btn danger" id="${p}SBDel" style="width:100%">🗑 Supprimer</button>
          </div>
        </div>
      </div>`;

    this.stage  = document.getElementById(`${p}S`);
    this.inner  = document.getElementById(`${p}I`);
    this.svg    = document.getElementById(`${p}V`);
    this.edgesG = document.getElementById(`${p}G`);

    // ── Bind toolbar ──
    if (!ro) {
      this._on(`${p}BAdd`, 'click', () => this.addNode());
      this._on(`${p}BTpl`, 'click', () => this.openTemplates());
      this._on(`${p}BGen`, 'click', () => this.generateFromEmployees());
      this._on(`${p}BFit`, 'click', () => this.fitView());
      this._on(`${p}BClr`, 'click', () => this.clearAll());
      this._on(`${p}EGen`, 'click', () => this.generateFromEmployees());
      this._on(`${p}EAdd`, 'click', () => this.addNode());
      this._on(`${p}ETpl`, 'click', () => this.openTemplates());
      // Sidebar
      this._on(`${p}SBX`,    'click', () => this._closeSB());
      this._on(`${p}SBOk`,  'click', () => this._applySB());
      this._on(`${p}SBDel`, 'click', () => this._deleteSel());
      this._on(`${p}SBTW`,  'click', () => this._setTC('SBTW','#ffffff'));
      this._on(`${p}SBTD`,  'click', () => this._setTC('SBTD','#1e293b'));
      this._on(`${p}SBFiche`,'click', () => {
        if (this.sel && typeof openEmployeDetail === 'function') openEmployeDetail(this.sel);
      });
    }

    // ── Stage events — clic sur fond vide = déplacer la vue ──
    this.stage.addEventListener('mousedown', e => {
      const onBg = e.target === this.stage || e.target === this.inner
                || e.target === this.svg   || e.target.tagName === 'g'
                || e.target.tagName === 'svg';
      if (onBg) {
        e.preventDefault();
        this._desel();
        this._pan = {sx:e.clientX, sy:e.clientY, tx:this.tx, ty:this.ty};
        this.stage.style.cursor = 'grabbing';
      }
    });
    this.stage.addEventListener('wheel', e => {
      e.preventDefault();
      this.zoom = Math.min(2.5, Math.max(0.2, this.zoom * (e.deltaY<0?1.1:0.9)));
      this._tf();
    }, {passive:false});
  }

  _on(id, ev, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  }

  // ── Données ──────────────────────────────────────────────
  _loadData() {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    const s = DATA.orgCharts[this.deptId];
    if (s && s.nodes && s.nodes.length) {
      this.nodes = JSON.parse(JSON.stringify(s.nodes));
      this.edges = JSON.parse(JSON.stringify(s.edges || []));
      this._render(); this._hideEmpty();
    } else {
      this._showEmpty();
    }
    this._tf();
  }

  _save() {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    DATA.orgCharts[this.deptId] = {
      nodes: this.nodes,
      edges: this.edges
    };
    if (typeof saveData === 'function') saveData();
  }

  // ── Rendu complet ─────────────────────────────────────────
  _render() {
    this.inner.querySelectorAll('.oc-node').forEach(n => n.remove());
    this._drawEdges();
    this.nodes.forEach(n => this._mkNode(n));
  }

  // ── Arêtes SVG ───────────────────────────────────────────
  _drawEdges() {
    this.edgesG.innerHTML = '';
    const p = this.p;

    // Ligne de connexion en cours
    if (this._conn) {
      const a = this.nodes.find(n => n.id === this._conn.from);
      if (a) {
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', a.x + a.w/2); line.setAttribute('y1', a.y + a.h);
        line.setAttribute('x2', this._conn.mx||0); line.setAttribute('y2', this._conn.my||0);
        line.setAttribute('stroke','#3b82f6'); line.setAttribute('stroke-width','2');
        line.setAttribute('stroke-dasharray','6,4');
        this.edgesG.appendChild(line);
      }
    }

    this.edges.forEach(e => {
      const a = this.nodes.find(n => n.id === e.from);
      const b = this.nodes.find(n => n.id === e.to);
      if (!a || !b) return;
      // Lire la hauteur réelle du DOM (auto-height)
      const ha = document.getElementById(`oc_${a.id}`)?.offsetHeight || a.h || 60;
      const hb = document.getElementById(`oc_${b.id}`)?.offsetHeight || b.h || 60;
      const x1=a.x+a.w/2, y1=a.y+ha, x2=b.x+b.w/2, y2=b.y;
      const cy=(y1+y2)/2;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',`M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`);
      path.setAttribute('fill','none'); path.setAttribute('stroke','#94a3b8');
      path.setAttribute('stroke-width','2');
      path.setAttribute('marker-end',`url(#${p}Arr)`);
      path.style.cursor='pointer';
      const eid = e.id;
      path.addEventListener('click', () => {
        if (confirm('Supprimer cette connexion ?')) {
          this.edges = this.edges.filter(x => x.id !== eid);
          this._drawEdges(); this._save();
        }
      });
      this.edgesG.appendChild(path);
    });
  }

  // ── Créer un nœud DOM ────────────────────────────────────
  _mkNode(node) {
    document.getElementById(`oc_${node.id}`)?.remove();
    const el = document.createElement('div');
    el.className = 'oc-node';
    el.id = `oc_${node.id}`;
    // height:auto — le nœud s'ajuste au contenu, largeur fixée par node.w
    el.style.cssText = `left:${node.x}px;top:${node.y}px;width:${node.w}px;background:${node.bg||'#1d4ed8'};color:${node.fg||'#fff'};`;

    el.innerHTML = `
      <div class="oc-nlbl" id="oL_${node.id}">${node.label||''}</div>
      <div class="oc-nsub" id="oS_${node.id}">${node.sub||''}</div>
      ${this.readOnly?'':`<span class="oc-del" title="Supprimer">✕</span>
      <div class="oc-rh oc-rh-e" data-dir="e" title="Glisser pour changer la largeur"></div>`}`;

    // Suppression
    if (!this.readOnly) {
      el.querySelector('.oc-del')?.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm('Supprimer ce nœud ?')) this._removeNode(node.id);
      });

      // Poignée de largeur (bord droit) — corrigée pour le zoom
      el.querySelector('.oc-rh-e')?.addEventListener('mousedown', e => {
        e.stopPropagation(); e.preventDefault();
        this._resize = {id: node.id, ox: e.clientX, w0: node.w};
        this.stage.style.cursor = 'ew-resize';
      });
    }

    // Clic = sélection / connexion
    el.addEventListener('mousedown', e => {
      if (e.target.classList.contains('oc-del')) return;
      if (e.target.classList.contains('oc-nlbl') && e.target.isContentEditable) return;
      e.stopPropagation(); e.preventDefault();

      if (e.shiftKey && !this.readOnly) {
        if (!this._conn) {
          this._conn = {from: node.id, mx: node.x+node.w/2, my: node.y+node.h};
          this._selEl(el);
        } else if (this._conn.from !== node.id) {
          this._addEdge(this._conn.from, node.id);
          this._conn = null;
          this.stage.style.cursor = '';
          this._drawEdges();
        }
        return;
      }

      // Drag
      if (!this.readOnly) {
        this._drag = {id: node.id, ox: e.clientX/this.zoom - node.x, oy: e.clientY/this.zoom - node.y};
      }
      this._selectNode(node.id, el);
    });

    // Double-clic = édition inline
    if (!this.readOnly) {
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        const isLabel = e.target.classList.contains('oc-nlbl');
        const target  = isLabel ? e.target : el.querySelector('.oc-nlbl');
        this._editInline(target, node, isLabel ? 'label' : 'sub');
      });
    }

    this.inner.appendChild(el);
  }

  // ── Sélection ────────────────────────────────────────────
  _selectNode(id, el) {
    this.sel = id;
    this.inner.querySelectorAll('.oc-node').forEach(n => n.classList.remove('selected'));
    if (el) el.classList.add('selected');
    if (!this.readOnly) {
      this._openSB(id);
    }
    // Ouvrir la fiche employé si le nœud correspond à un employé
    if (typeof openEmployeDetail === 'function') {
      const d = typeof DATA !== 'undefined' ? DATA : null;
      const emps = (d && d.employes) ? d.employes : (APP_DATA ? APP_DATA.employes : []);
      if (emps && emps.find(e => e.id === id)) {
        openEmployeDetail(id);
      }
    }
  }
  _selEl(el) {
    this.inner.querySelectorAll('.oc-node').forEach(n => n.classList.remove('selected'));
    el?.classList.add('selected');
  }
  _desel() {
    this.sel = null;
    this._conn = null;
    this.stage.style.cursor = '';
    this.inner.querySelectorAll('.oc-node').forEach(n => n.classList.remove('selected'));
    this._closeSB();
    this._drawEdges();
  }

  // ── Sidebar ───────────────────────────────────────────────
  _openSB(id) {
    const nd = this.nodes.find(n => n.id === id);
    if (!nd || this.readOnly) return;
    const p = this.p;
    document.getElementById(`${p}SB`).style.display = 'flex';
    document.getElementById(`${p}SBL`).value = nd.label || '';
    document.getElementById(`${p}SBS`).value = nd.sub   || '';
    document.getElementById(`${p}SBC`).value = nd.bg    || '#1d4ed8';
    const isW = (nd.fg||'#fff') === '#ffffff';
    document.getElementById(`${p}SBTW`).style.outline = isW  ? '2px solid #fbbf24' : 'none';
    document.getElementById(`${p}SBTD`).style.outline = !isW ? '2px solid #fbbf24' : 'none';
    this._tcChoice = nd.fg || '#ffffff';
    // Afficher/cacher le bouton fiche selon si l'ID correspond à un employé
    const d = typeof DATA !== 'undefined' ? DATA : null;
    const emps = (d && d.employes) ? d.employes : (typeof APP_DATA !== 'undefined' ? APP_DATA.employes : []);
    const isEmp = !!(emps && emps.find(e => e.id === id));
    const ficheBtn = document.getElementById(`${p}SBFiche`);
    if (ficheBtn) ficheBtn.style.display = isEmp ? 'block' : 'none';
  }
  _closeSB() {
    document.getElementById(`${this.p}SB`)?.style &&
      (document.getElementById(`${this.p}SB`).style.display = 'none');
  }
  _setTC(btnSuffix, color) {
    const p = this.p;
    this._tcChoice = color;
    document.getElementById(`${p}SBTW`).style.outline = color==='#ffffff' ? '2px solid #fbbf24' : 'none';
    document.getElementById(`${p}SBTD`).style.outline = color==='#1e293b' ? '2px solid #fbbf24' : 'none';
  }
  _applySB() {
    const nd = this.nodes.find(n => n.id === this.sel);
    if (!nd) return;
    const p = this.p;
    nd.label = document.getElementById(`${p}SBL`).value.trim();
    nd.sub   = document.getElementById(`${p}SBS`).value.trim();
    nd.bg    = document.getElementById(`${p}SBC`).value;
    nd.fg    = this._tcChoice || '#ffffff';
    // Mettre à jour le DOM sans tout re-render
    const el = document.getElementById(`oc_${nd.id}`);
    if (el) {
      el.style.background = nd.bg; el.style.color = nd.fg;
      el.querySelector('.oc-nlbl').textContent = nd.label;
      el.querySelector('.oc-nsub').textContent = nd.sub;
    }
    this._save();
  }
  _deleteSel() {
    if (!this.sel || !confirm('Supprimer ce nœud et ses connexions ?')) return;
    this._removeNode(this.sel);
    this._closeSB();
  }
  _removeNode(id) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    document.getElementById(`oc_${id}`)?.remove();
    if (this.sel === id) { this.sel = null; this._closeSB(); }
    this._drawEdges(); this._save();
    if (!this.nodes.length) this._showEmpty();
  }

  // ── Édition inline ────────────────────────────────────────
  _editInline(el, node, field) {
    el.contentEditable = 'true';
    el.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    const done = () => {
      el.contentEditable = 'false';
      node[field] = el.textContent.trim();
      this._save();
    };
    el.addEventListener('blur',    done, {once:true});
    el.addEventListener('keydown', e => {
      if (e.key==='Enter')  { e.preventDefault(); el.blur(); }
      if (e.key==='Escape') { el.textContent = node[field]; el.blur(); }
    });
  }

  // ── Souris globale ────────────────────────────────────────
  _mouseMove(e) {
    if (this._pan) {
      this.tx = this._pan.tx + (e.clientX - this._pan.sx);
      this.ty = this._pan.ty + (e.clientY - this._pan.sy);
      this._tf(); return;
    }
    if (this._resize) {
      const nd = this.nodes.find(n => n.id === this._resize.id);
      if (!nd) return;
      nd.w = Math.max(120, Math.round(this._resize.w0 + (e.clientX - this._resize.ox) / this.zoom));
      const el = document.getElementById(`oc_${nd.id}`);
      if (el) el.style.width = nd.w + 'px';
      this._drawEdges(); return;
    }
    if (this._drag) {
      const nd = this.nodes.find(n => n.id === this._drag.id);
      if (!nd) return;
      nd.x = Math.max(0, Math.round(e.clientX/this.zoom - this._drag.ox));
      nd.y = Math.max(0, Math.round(e.clientY/this.zoom - this._drag.oy));
      const el = document.getElementById(`oc_${nd.id}`);
      if (el) { el.style.left = nd.x+'px'; el.style.top = nd.y+'px'; }
      this._drawEdges(); return;
    }
    if (this._conn) {
      const r = this.inner.getBoundingClientRect();
      this._conn.mx = (e.clientX - r.left) / this.zoom;
      this._conn.my = (e.clientY - r.top)  / this.zoom;
      this._drawEdges();
    }
  }
  _mouseUp(e) {
    if (this._drag)   { this._save(); this._drag = null; }
    if (this._resize) { this._save(); this._resize = null; }
    if (this._pan)    { this._pan = null; }
    this.stage.style.cursor = '';
  }

  // ── Connexion ─────────────────────────────────────────────
  _addEdge(from, to) {
    if (this.edges.some(e => e.from===from && e.to===to)) return;
    this.edges.push({id:'e_'+Date.now(), from, to});
    this._save();
  }

  // ── Transformation ────────────────────────────────────────
  _tf() {
    this.inner.style.transform = `translate(${this.tx}px,${this.ty}px) scale(${this.zoom})`;
  }

  // ── Recadrer ──────────────────────────────────────────────
  fitView() {
    if (!this.nodes.length) return;
    const pad=60, W=this.stage.offsetWidth||800, H=this.stage.offsetHeight||500;
    const minX=Math.min(...this.nodes.map(n=>n.x)), minY=Math.min(...this.nodes.map(n=>n.y));
    const maxX=Math.max(...this.nodes.map(n=>n.x+n.w)), maxY=Math.max(...this.nodes.map(n=>n.y+n.h));
    this.zoom = Math.min(1.4, Math.max(0.15, Math.min((W-pad*2)/(maxX-minX||1), (H-pad*2)/(maxY-minY||1))));
    this.tx = pad - minX*this.zoom;
    this.ty = pad - minY*this.zoom;
    this._tf();
  }

  // ── Ajouter un nœud ──────────────────────────────────────
  addNode() {
    this._hideEmpty();
    const nd = {
      id:    'n_'+Date.now(),
      x:     80 + (this.nodes.length%5)*40,
      y:     80 + Math.floor(this.nodes.length/5)*90,
      w:     180, h:65,
      label: 'Nouveau rôle',
      sub:   'Service',
      bg:    '#1d4ed8', fg:'#fff'
    };
    this.nodes.push(nd);
    this._mkNode(nd);
    this._save();
    setTimeout(() => {
      const el = document.getElementById(`oc_${nd.id}`);
      if (el) this._selectNode(nd.id, el);
      this._editInline(document.getElementById(`oL_${nd.id}`), nd, 'label');
    }, 60);
  }

  // ── Vider ────────────────────────────────────────────────
  clearAll() {
    if (!confirm('Vider complètement cet organigramme ?')) return;
    this.nodes=[]; this.edges=[];
    this.inner.querySelectorAll('.oc-node').forEach(n=>n.remove());
    this.edgesG.innerHTML='';
    this._save(); this._showEmpty();
  }

  // ── Canvas vide ──────────────────────────────────────────
  _showEmpty() { const e=document.getElementById(`${this.p}E`); if(e) e.style.display='flex'; }
  _hideEmpty() { const e=document.getElementById(`${this.p}E`); if(e) e.style.display='none'; }

  // ── Templates ────────────────────────────────────────────
  openTemplates() {
    const body = document.getElementById('employeFormBody');
    if (!body) { alert('Erreur: modal introuvable'); return; }
    body.innerHTML = `
      <h2>📋 Choisir un modèle de départ</h2>
      <p style="color:#64748b;font-size:.88rem;margin-bottom:14px">
        Le modèle remplace l'organigramme actuel. Vous pourrez ensuite tout modifier.
      </p>
      <div class="oc-template-grid">
        ${Object.entries(TEMPLATES_CONFIG).map(([k,t])=>`
          <div class="oc-template-card" data-tpl="${k}">
            <div class="oc-tpl-icon">${k==='standard'?'🏢':k==='logistique'?'🏭':k==='commercial'?'💼':'👥'}</div>
            <div class="oc-tpl-name">${t.label}</div>
            <div class="oc-tpl-desc">${t.nodes.length} nœuds · ${t.edges.length} liens</div>
          </div>`).join('')}
      </div>
      <div class="modal-actions" style="margin-top:16px">
        <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
      </div>`;
    if (typeof openModal === 'function') openModal('employeFormModal');
    body.querySelectorAll('[data-tpl]').forEach(card => {
      card.addEventListener('click', () => {
        this.loadTemplate(card.dataset.tpl);
        if (typeof closeAllModals === 'function') closeAllModals();
      });
    });
  }

  loadTemplate(type) {
    const tpl = TEMPLATES_CONFIG[type];
    if (!tpl) return;
    if (this.nodes.length && !confirm('Remplacer l\'organigramme actuel ?')) return;
    this.nodes = JSON.parse(JSON.stringify(tpl.nodes));
    this.edges = JSON.parse(JSON.stringify(tpl.edges));
    this._save(); this._render(); this._hideEmpty();
    setTimeout(() => this.fitView(), 80);
  }

  // ── Générer l'organigramme depuis les données employés ───────
  generateFromEmployees() {
    // DATA peut venir de localStorage sans employes → on prend toujours APP_DATA comme référence
    const d = typeof DATA !== 'undefined' ? DATA : null;
    const allEmps  = (d && d.employes && d.employes.length) ? d.employes : APP_DATA.employes;
    const postes   = (d && d.postes  && d.postes.length)   ? d.postes   : APP_DATA.postes;
    // Filtrer par département courant (deptId absent = Luxolor legacy)
    const deptId   = this.deptId;
    const emps     = allEmps.filter(e => e.deptId === deptId || (!e.deptId && deptId === 'dept_logistique'));
    if (!emps || !emps.length) { alert('Aucun employé trouvé pour ce département.'); return; }
    if (this.nodes.length && !confirm('Remplacer l\'organigramme actuel par la liste des équipes ?')) return;
    const posteM  = {};
    postes.forEach(p => posteM[p.id] = p);

    // Construire la map enfants
    const childMap = {};
    emps.forEach(e => {
      const k = e.managerId || '__root__';
      if (!childMap[k]) childMap[k] = [];
      childMap[k].push(e);
    });

    // Trouver la racine
    const root = emps.find(e => !e.managerId);
    if (!root) { alert('Aucun employé sans manager trouvé (racine introuvable).'); return; }

    const nodes = [], edges = [];

    // Couleurs par branche
    const BCOL = [
      {bg:'#1d4ed8', lbg:'#bfdbfe', lfg:'#1e3a8a'},
      {bg:'#15803d', lbg:'#bbf7d0', lfg:'#14532d'},
      {bg:'#7c3aed', lbg:'#e9d5ff', lfg:'#4c1d95'},
      {bg:'#c2410c', lbg:'#fed7aa', lfg:'#7c2d12'},
    ];

    // Dimensions des nœuds
    const RH=72, RW=220;
    const MH=68, MW=180;
    const AH=62, AW=168;
    const PER_ROW  = 2;    // agents par rangée dans chaque branche
    const AG_H_GAP = 12;   // espace horizontal entre agents
    const AG_V_GAP = 10;   // espace vertical entre rangées
    const BRANCH_GAP = 28; // espace entre branches

    // Largeur d'une branche = PER_ROW agents côte à côte
    const branchW = PER_ROW * AW + (PER_ROW - 1) * AG_H_GAP; // 168+12+168 = 348

    const managers = childMap[root.id] || [];

    // Calculer la position X de départ de chaque branche
    const branchX = [];
    let curX = 0;
    managers.forEach((mgr, bi) => {
      branchX.push(curX);
      curX += branchW + BRANCH_GAP;
    });
    const totalW = curX - BRANCH_GAP;
    const rootX  = Math.max(0, (totalW - RW) / 2);

    // Root
    const pRoot = posteM[root.posteId];
    nodes.push({
      id: root.id, x: rootX, y: 20, w: RW, h: RH,
      label: `${root.prenom} ${root.nom}`,
      sub:   pRoot ? pRoot.intitule : '',
      bg: '#0f172a', fg: '#fff'
    });

    const mgrY = 20 + RH + 36;

    managers.forEach((mgr, bi) => {
      const col   = BCOL[bi % BCOL.length];
      const bx    = branchX[bi];
      const mgrX  = bx + (branchW - MW) / 2;   // manager centré sur la branche
      const pMgr  = posteM[mgr.posteId];

      nodes.push({
        id: mgr.id, x: mgrX, y: mgrY, w: MW, h: MH,
        label: `${mgr.prenom} ${mgr.nom}`,
        sub:   pMgr ? pMgr.intitule : '',
        bg: col.bg, fg: '#fff'
      });
      edges.push({id:`e_${root.id}_${mgr.id}`, from: root.id, to: mgr.id});

      // Agents : PER_ROW par rangée
      const agents = childMap[mgr.id] || [];
      const agStartY = mgrY + MH + 20;

      agents.forEach((ag, ai) => {
        const agCol = ai % PER_ROW;
        const agRow = Math.floor(ai / PER_ROW);
        const pAg   = posteM[ag.posteId];
        const agX   = bx + agCol * (AW + AG_H_GAP);
        const agY   = agStartY + agRow * (AH + AG_V_GAP);
        const isPlaceholder = ag.prenom.includes('nommer') || ag.nom.includes('compléter');
        nodes.push({
          id: ag.id,
          x: agX, y: agY, w: AW, h: AH,
          label: isPlaceholder ? ag.prenom : `${ag.prenom} ${ag.nom}`,
          sub:   pAg ? pAg.intitule : '',
          bg: col.lbg, fg: col.lfg
        });
        edges.push({id:`e_${mgr.id}_${ag.id}`, from: mgr.id, to: ag.id});
      });
    });

    this.nodes = nodes;
    this.edges = edges;
    this._save();
    this._render();
    this._hideEmpty();
    setTimeout(() => this.fitView(), 80);
  }

  initialiserNouveauDepartement(id) {
    if (!DATA.orgCharts) DATA.orgCharts={};
    DATA.orgCharts[id] = {nodes:[],edges:[]};
    if (this.deptId===id) { this.nodes=[]; this.edges=[]; this._render(); this._showEmpty(); }
    if (typeof saveData==='function') saveData();
  }

  destroy() {
    window.removeEventListener('mousemove', this._onMv);
    window.removeEventListener('mouseup',   this._onUp);
  }
}
