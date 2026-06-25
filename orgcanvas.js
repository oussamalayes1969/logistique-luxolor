// =========================================================
// OrgCanvas — Moteur d'organigramme interactif
// Vanilla JS + SVG, zéro dépendance
// =========================================================

class OrgCanvas {

  constructor(containerId, deptId, readOnly) {
    this.containerId = containerId;
    this.deptId      = deptId;
    this.readOnly    = readOnly || false;
    this.nodes       = [];
    this.edges       = [];
    this.selected    = null;
    this.drag        = null;   // { nodeId, ox, oy }
    this.connect     = null;   // { fromId, mx, my }
    this.panStart    = null;   // { sx, sy, tx, ty }
    this.tx = 40; this.ty = 40; this.zoom = 1;

    this._boundMove = e => this._onMove(e);
    this._boundUp   = e => this._onUp(e);
    window.addEventListener('mousemove', this._boundMove);
    window.addEventListener('mouseup',   this._boundUp);

    this._build();
    this._loadFromData();
  }

  // ── Construire le DOM ──────────────────────────────────────
  _build() {
    const wrap = document.getElementById(this.containerId);
    if (!wrap) return;

    const toolbar = this.readOnly ? '' : `
      <div class="oc-toolbar">
        <button class="btn oc-tbtn" onclick="window._oc.addNode()">＋ Nœud</button>
        <button class="btn oc-tbtn secondary" onclick="window._oc.openTemplates()">📋 Modèle</button>
        <span style="flex:1"></span>
        <button class="btn oc-tbtn secondary" onclick="window._oc.fitView()">⊙ Recadrer</button>
        <button class="btn oc-tbtn secondary" onclick="window._oc.clearAll()">🗑 Vider</button>
        <span class="oc-hint">Maj+clic = relier · Dbl-clic = éditer · Drag = déplacer</span>
      </div>`;

    wrap.innerHTML = toolbar + `
      <div class="oc-stage" id="${this.containerId}_stage">
        <div class="oc-inner" id="${this.containerId}_inner">
          <svg class="oc-svg" id="${this.containerId}_svg"
            xmlns="http://www.w3.org/2000/svg" overflow="visible">
            <defs>
              <marker id="oc-arr" markerWidth="10" markerHeight="7"
                refX="9" refY="3.5" orient="auto">
                <polygon points="0 0,10 3.5,0 7" fill="#94a3b8"/>
              </marker>
            </defs>
            <g id="${this.containerId}_edges"></g>
          </svg>
        </div>
      </div>`;

    this.stage  = document.getElementById(`${this.containerId}_stage`);
    this.inner  = document.getElementById(`${this.containerId}_inner`);
    this.svg    = document.getElementById(`${this.containerId}_svg`);
    this.edgesG = document.getElementById(`${this.containerId}_edges`);

    // Zoom molette
    this.stage.addEventListener('wheel', e => {
      e.preventDefault();
      const f = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.min(2.5, Math.max(0.2, this.zoom * f));
      this._applyTransform();
    }, { passive: false });

    // Pan (Alt+drag ou bouton milieu)
    this.stage.addEventListener('mousedown', e => {
      if (e.button === 1 || e.altKey) {
        e.preventDefault();
        this.panStart = { sx: e.clientX, sy: e.clientY, tx: this.tx, ty: this.ty };
      } else if (e.target === this.stage || e.target === this.inner || e.target === this.svg) {
        this._deselect();
      }
    });
  }

  // ── Transformation pan/zoom ────────────────────────────────
  _applyTransform() {
    this.inner.style.transform = `translate(${this.tx}px,${this.ty}px) scale(${this.zoom})`;
  }

  // ── Chargement données ─────────────────────────────────────
  _loadFromData() {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    const saved = DATA.orgCharts[this.deptId];
    if (saved && saved.nodes) {
      this.nodes = JSON.parse(JSON.stringify(saved.nodes));
      this.edges = JSON.parse(JSON.stringify(saved.edges || []));
    }
    this._renderAll();
  }

  _save() {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    DATA.orgCharts[this.deptId] = {
      nodes: this.nodes,
      edges: this.edges
    };
    saveData();
  }

  // ── Rendu complet ──────────────────────────────────────────
  _renderAll() {
    // Supprimer anciens nœuds
    this.inner.querySelectorAll('.oc-node').forEach(n => n.remove());
    // Rendre arêtes
    this._renderEdges();
    // Rendre nœuds
    this.nodes.forEach(n => this._createNodeEl(n));
    // Canvas vide ?
    const emptyId = `${this.containerId}_empty`;
    document.getElementById(emptyId)?.remove();
    if (!this.nodes.length) this._showEmpty();
    // Appliquer transform
    this._applyTransform();
  }

  _showEmpty() {
    const dept = (typeof getDept === 'function' ? getDept(this.deptId) : null) || {};
    const el = document.createElement('div');
    el.id = `${this.containerId}_empty`;
    el.className = 'oc-empty';
    el.innerHTML = `
      <div style="font-size:3rem">${dept.icone || '🏢'}</div>
      <h3>Organigramme vide — ${dept.nom || 'Département'}</h3>
      <p>Commencez par créer un nœud ou chargez un modèle.</p>
      ${this.readOnly ? '' : `
        <div style="display:flex;gap:12px;justify-content:center;margin-top:14px">
          <button class="btn" onclick="window._oc.addNode()">＋ Créer le premier nœud</button>
          <button class="btn secondary" onclick="window._oc.openTemplates()">📋 Choisir un modèle</button>
        </div>`}
    `;
    this.stage.appendChild(el);
  }

  // ── Rendu arêtes SVG ──────────────────────────────────────
  _renderEdges() {
    this.edgesG.innerHTML = '';

    this.edges.forEach(edge => {
      const a = this.nodes.find(n => n.id === edge.from);
      const b = this.nodes.find(n => n.id === edge.to);
      if (!a || !b) return;

      const x1 = a.x + a.w / 2, y1 = a.y + a.h;
      const x2 = b.x + b.w / 2, y2 = b.y;
      const cy = (y1 + y2) / 2;
      const d  = `M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#oc-arr)');
      path.style.cursor = 'pointer';
      path.addEventListener('click', () => {
        if (confirm('Supprimer cette connexion ?')) {
          this.edges = this.edges.filter(e => e.id !== edge.id);
          this._renderEdges(); this._save();
        }
      });
      this.edgesG.appendChild(path);
    });

    // Ligne de connexion en cours
    if (this.connect) {
      const a = this.nodes.find(n => n.id === this.connect.fromId);
      if (a) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x + a.w / 2);
        line.setAttribute('y1', a.y + a.h);
        line.setAttribute('x2', this.connect.mx);
        line.setAttribute('y2', this.connect.my);
        line.setAttribute('stroke', '#3b82f6');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '6,4');
        this.edgesG.appendChild(line);
      }
    }
  }

  // ── Créer l'élément DOM d'un nœud ─────────────────────────
  _createNodeEl(node) {
    const existing = document.getElementById(`ocn_${node.id}`);
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'oc-node';
    el.id = `ocn_${node.id}`;
    el.style.cssText = `left:${node.x}px;top:${node.y}px;width:${node.w}px;height:${node.h}px;background:${node.color||'#1d4ed8'};color:${node.textColor||'#fff'};`;

    el.innerHTML = `
      <div class="oc-label" id="ocl_${node.id}" contenteditable="false">${node.label||'Nouveau'}</div>
      <div class="oc-sub"   id="ocs_${node.id}" contenteditable="false">${node.sublabel||''}</div>
      ${this.readOnly ? '' : `<span class="oc-del" onclick="event.stopPropagation();window._oc.deleteNode('${node.id}')">✕</span>`}
    `;

    // Drag
    el.addEventListener('mousedown', e => {
      if (e.target.classList.contains('oc-del')) return;
      if (e.target.isContentEditable && e.target.contentEditable === 'true') return;
      e.preventDefault(); e.stopPropagation();

      // Maj+clic = connexion
      if (e.shiftKey) {
        if (!this.connect) {
          this.connect = { fromId: node.id, mx: node.x + node.w/2, my: node.y + node.h };
          this._selectNode(node.id);
          this.stage.style.cursor = 'crosshair';
        } else {
          this._finishConnect(node.id);
        }
        return;
      }

      // Drag normal
      if (!this.readOnly) {
        const r = this.inner.getBoundingClientRect();
        this.drag = {
          nodeId: node.id,
          ox: e.clientX / this.zoom - node.x,
          oy: e.clientY / this.zoom - node.y
        };
        this._selectNode(node.id);
        this.stage.style.cursor = 'grabbing';
      }
    });

    // Double-clic = édition
    if (!this.readOnly) {
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        this._editNode(node.id, e.target.classList.contains('oc-sub') ? 'sublabel' : 'label');
      });
    }

    // Resize natif CSS
    if (!this.readOnly) {
      let resizeTimer;
      const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const nd = this.nodes.find(n => n.id === node.id);
          if (!nd) return;
          const nw = el.offsetWidth, nh = el.offsetHeight;
          if (nd.w !== nw || nd.h !== nh) {
            nd.w = nw; nd.h = nh;
            this._renderEdges(); this._save();
          }
        }, 80);
      });
      ro.observe(el);
    }

    this.inner.appendChild(el);
  }

  // ── Gestion souris globale ─────────────────────────────────
  _onMove(e) {
    if (this.panStart) {
      this.tx = this.panStart.tx + (e.clientX - this.panStart.sx);
      this.ty = this.panStart.ty + (e.clientY - this.panStart.sy);
      this._applyTransform();
      return;
    }

    if (this.drag) {
      const nd = this.nodes.find(n => n.id === this.drag.nodeId);
      if (!nd) return;
      nd.x = Math.max(0, Math.round(e.clientX / this.zoom - this.drag.ox));
      nd.y = Math.max(0, Math.round(e.clientY / this.zoom - this.drag.oy));
      const el = document.getElementById(`ocn_${nd.id}`);
      if (el) { el.style.left = nd.x + 'px'; el.style.top = nd.y + 'px'; }
      this._renderEdges();
      return;
    }

    if (this.connect) {
      // Convertir coordonnées écran → espace canvas
      const r = this.inner.getBoundingClientRect();
      this.connect.mx = (e.clientX - r.left) / this.zoom;
      this.connect.my = (e.clientY - r.top)  / this.zoom;
      this._renderEdges();
    }
  }

  _onUp(e) {
    if (this.drag) { this._save(); this.drag = null; this.stage.style.cursor = ''; }
    if (this.panStart) { this.panStart = null; }
  }

  // ── Sélection ─────────────────────────────────────────────
  _selectNode(id) {
    this.selected = id;
    this.inner.querySelectorAll('.oc-node').forEach(el =>
      el.classList.toggle('selected', el.id === `ocn_${id}`)
    );
  }

  _deselect() {
    if (this.connect) { this.connect = null; this.stage.style.cursor = ''; this._renderEdges(); }
    this.selected = null;
    this.inner.querySelectorAll('.oc-node').forEach(el => el.classList.remove('selected'));
  }

  // ── Connexion ──────────────────────────────────────────────
  _finishConnect(toId) {
    if (this.connect.fromId !== toId) {
      const exists = this.edges.some(e => e.from === this.connect.fromId && e.to === toId);
      if (!exists) {
        this.edges.push({ id: 'e_' + Date.now(), from: this.connect.fromId, to: toId });
        this._save();
      }
    }
    this.connect = null;
    this.stage.style.cursor = '';
    this._renderEdges();
  }

  // ── Édition inline ─────────────────────────────────────────
  _editNode(nodeId, field) {
    const nd = this.nodes.find(n => n.id === nodeId);
    if (!nd) return;
    const el = document.getElementById(field === 'label' ? `ocl_${nodeId}` : `ocs_${nodeId}`);
    if (!el) return;
    el.contentEditable = 'true';
    el.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges(); sel.addRange(range);

    const commit = () => {
      el.contentEditable = 'false';
      nd[field] = el.textContent.trim() || nd[field];
      this._save();
    };
    el.addEventListener('blur', commit, { once: true });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { el.textContent = nd[field]; el.blur(); }
    });
  }

  // ── Ajouter un nœud ───────────────────────────────────────
  addNode(opts = {}) {
    document.getElementById(`${this.containerId}_empty`)?.remove();
    const node = {
      id:        'n_' + Date.now(),
      x:         opts.x !== undefined ? opts.x : 80 + (this.nodes.length % 5) * 40,
      y:         opts.y !== undefined ? opts.y : 80 + Math.floor(this.nodes.length / 5) * 90,
      w:         opts.w || 180,
      h:         opts.h || 70,
      label:     opts.label    || 'Nouveau poste',
      sublabel:  opts.sublabel || '',
      color:     opts.color    || '#1d4ed8',
      textColor: opts.textColor || '#fff'
    };
    this.nodes.push(node);
    this._createNodeEl(node);
    this._save();
    if (!opts.label) setTimeout(() => this._editNode(node.id, 'label'), 60);
    return node;
  }

  // ── Supprimer un nœud ─────────────────────────────────────
  deleteNode(nodeId) {
    if (!confirm('Supprimer ce nœud et ses connexions ?')) return;
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.edges = this.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    document.getElementById(`ocn_${nodeId}`)?.remove();
    this._renderEdges(); this._save();
    if (!this.nodes.length) this._showEmpty();
  }

  // ── Vider le canvas ───────────────────────────────────────
  clearAll() {
    if (!confirm('Vider complètement cet organigramme ?')) return;
    this.nodes = []; this.edges = [];
    this._save(); this._renderAll();
  }

  // ── Recadrer la vue ───────────────────────────────────────
  fitView() {
    if (!this.nodes.length) return;
    const pad = 60;
    const minX = Math.min(...this.nodes.map(n => n.x));
    const minY = Math.min(...this.nodes.map(n => n.y));
    const maxX = Math.max(...this.nodes.map(n => n.x + n.w));
    const maxY = Math.max(...this.nodes.map(n => n.y + n.h));
    const W = this.stage.offsetWidth  || 800;
    const H = this.stage.offsetHeight || 500;
    const sx = (W - pad * 2) / (maxX - minX || 1);
    const sy = (H - pad * 2) / (maxY - minY || 1);
    this.zoom = Math.min(1.6, Math.min(sx, sy));
    this.tx   = pad - minX * this.zoom;
    this.ty   = pad - minY * this.zoom;
    this._applyTransform();
  }

  // ── Modal Templates ───────────────────────────────────────
  openTemplates() {
    const body = document.getElementById('employeFormBody');
    body.innerHTML = `
      <h2>📋 Choisir un modèle de départ</h2>
      <p style="color:#64748b;font-size:.88rem">Le modèle remplacera l'organigramme actuel.</p>
      <div class="oc-template-grid">
        ${this._tplCard('standard',   '🏢', 'Standard',      'DG → Managers → Agents')}
        ${this._tplCard('logistique', '🏭', 'Logistique',    '4 pôles : Dépôt · Vente · Admin · Stock')}
        ${this._tplCard('commercial', '💼', 'Commercial',    'Zones + ADV')}
        ${this._tplCard('plat',       '◼◼', 'Organisation plate', 'Chef + équipe parallèle')}
        ${this._tplCard('matriciel',  '⊞', 'Matriciel',     'Projets × Fonctions')}
      </div>
      <div class="modal-actions"><button class="btn secondary" onclick="closeAllModals()">Annuler</button></div>`;
    openModal('employeFormModal');
  }

  _tplCard(type, icon, title, desc) {
    return `<div class="oc-template-card" onclick="window._oc.loadTemplate('${type}')">
      <div class="oc-tpl-icon">${icon}</div>
      <div class="oc-tpl-name">${title}</div>
      <div class="oc-tpl-desc">${desc}</div>
    </div>`;
  }

  loadTemplate(type) {
    if (this.nodes.length && !confirm('Remplacer l\'organigramme actuel par ce modèle ?')) return;
    closeAllModals();

    const T = {
      standard: {
        nodes:[
          {id:'t0',x:300,y:20, w:200,h:70,label:'Directeur Général',   sublabel:'Direction',       color:'#1d4ed8',textColor:'#fff'},
          {id:'t1',x:60, y:160,w:170,h:60,label:'Manager Opérations',  sublabel:'Opérations',      color:'#2563eb',textColor:'#fff'},
          {id:'t2',x:300,y:160,w:170,h:60,label:'Manager Commercial',  sublabel:'Commercial',      color:'#2563eb',textColor:'#fff'},
          {id:'t3',x:540,y:160,w:170,h:60,label:'Manager RH',          sublabel:'Ressources Hum.', color:'#2563eb',textColor:'#fff'},
          {id:'t4',x:10, y:300,w:150,h:55,label:'Agent Op. 1',         sublabel:'',color:'#bfdbfe',textColor:'#1e3a8a'},
          {id:'t5',x:170,y:300,w:150,h:55,label:'Agent Op. 2',         sublabel:'',color:'#bfdbfe',textColor:'#1e3a8a'},
          {id:'t6',x:255,y:300,w:150,h:55,label:'Commercial 1',        sublabel:'',color:'#bfdbfe',textColor:'#1e3a8a'},
          {id:'t7',x:415,y:300,w:150,h:55,label:'Commercial 2',        sublabel:'',color:'#bfdbfe',textColor:'#1e3a8a'},
          {id:'t8',x:500,y:300,w:150,h:55,label:'RH Recrutement',      sublabel:'',color:'#bfdbfe',textColor:'#1e3a8a'},
          {id:'t9',x:660,y:300,w:150,h:55,label:'RH Formation',        sublabel:'',color:'#bfdbfe',textColor:'#1e3a8a'},
        ],
        edges:[
          {id:'e0',from:'t0',to:'t1'},{id:'e1',from:'t0',to:'t2'},{id:'e2',from:'t0',to:'t3'},
          {id:'e3',from:'t1',to:'t4'},{id:'e4',from:'t1',to:'t5'},
          {id:'e5',from:'t2',to:'t6'},{id:'e6',from:'t2',to:'t7'},
          {id:'e7',from:'t3',to:'t8'},{id:'e8',from:'t3',to:'t9'},
        ]
      },
      logistique: {
        nodes:[
          {id:'l0',x:280,y:20, w:220,h:70,label:'Directeur Logistique', sublabel:'Oussama Layes',     color:'#0f172a',textColor:'#fff'},
          {id:'l1',x:10, y:170,w:185,h:60,label:'Resp. Dépôt Central',  sublabel:'Zied Graf',         color:'#1d4ed8',textColor:'#fff'},
          {id:'l2',x:215,y:170,w:185,h:60,label:'Resp. Vente en ligne', sublabel:'À nommer',          color:'#15803d',textColor:'#fff'},
          {id:'l3',x:420,y:170,w:185,h:60,label:'Resp. Administratif',  sublabel:'Omar Dhamna',       color:'#7c3aed',textColor:'#fff'},
          {id:'l4',x:625,y:170,w:185,h:60,label:'Gestionnaire Stock',   sublabel:'Houcem Charfi',     color:'#c2410c',textColor:'#fff'},
          {id:'l5',x:10, y:310,w:175,h:50,label:'Agents Dépôt (×12)',   sublabel:'Dépôt Central',     color:'#bfdbfe',textColor:'#1e3a8a'},
          {id:'l6',x:215,y:310,w:175,h:50,label:'Agents Vente (×7)',    sublabel:'Vente en ligne',    color:'#bbf7d0',textColor:'#14532d'},
          {id:'l7',x:420,y:310,w:175,h:50,label:'Administratifs (×3)',  sublabel:'Administratif',     color:'#e9d5ff',textColor:'#4c1d95'},
          {id:'l8',x:625,y:310,w:175,h:50,label:'Agents Stock (×2)',    sublabel:'Gestion des stocks',color:'#fed7aa',textColor:'#7c2d12'},
        ],
        edges:[
          {id:'e0',from:'l0',to:'l1'},{id:'e1',from:'l0',to:'l2'},
          {id:'e2',from:'l0',to:'l3'},{id:'e3',from:'l0',to:'l4'},
          {id:'e4',from:'l1',to:'l5'},{id:'e5',from:'l2',to:'l6'},
          {id:'e6',from:'l3',to:'l7'},{id:'e7',from:'l4',to:'l8'},
        ]
      },
      commercial: {
        nodes:[
          {id:'c0',x:270,y:20, w:200,h:70,label:'Directeur Commercial',sublabel:'Direction',    color:'#c2410c',textColor:'#fff'},
          {id:'c1',x:80, y:160,w:180,h:60,label:'Chef Ventes Nord',   sublabel:'Zone Nord',    color:'#ea580c',textColor:'#fff'},
          {id:'c2',x:400,y:160,w:180,h:60,label:'Chef Ventes Sud',    sublabel:'Zone Sud',     color:'#ea580c',textColor:'#fff'},
          {id:'c3',x:660,y:160,w:180,h:60,label:'Responsable ADV',    sublabel:'Admin Ventes', color:'#ea580c',textColor:'#fff'},
          {id:'c4',x:20, y:290,w:155,h:55,label:'Commercial 1',sublabel:'Nord',color:'#fed7aa',textColor:'#7c2d12'},
          {id:'c5',x:185,y:290,w:155,h:55,label:'Commercial 2',sublabel:'Nord',color:'#fed7aa',textColor:'#7c2d12'},
          {id:'c6',x:340,y:290,w:155,h:55,label:'Commercial 3',sublabel:'Sud', color:'#fed7aa',textColor:'#7c2d12'},
          {id:'c7',x:505,y:290,w:155,h:55,label:'Commercial 4',sublabel:'Sud', color:'#fed7aa',textColor:'#7c2d12'},
          {id:'c8',x:660,y:290,w:155,h:55,label:'Assistante ADV',sublabel:'',  color:'#fed7aa',textColor:'#7c2d12'},
        ],
        edges:[
          {id:'e0',from:'c0',to:'c1'},{id:'e1',from:'c0',to:'c2'},{id:'e2',from:'c0',to:'c3'},
          {id:'e3',from:'c1',to:'c4'},{id:'e4',from:'c1',to:'c5'},
          {id:'e5',from:'c2',to:'c6'},{id:'e6',from:'c2',to:'c7'},
          {id:'e7',from:'c3',to:'c8'},
        ]
      },
      plat: {
        nodes:[
          {id:'p0',x:265,y:20, w:190,h:65,label:'Responsable d\'équipe',sublabel:'Direction',color:'#0369a1',textColor:'#fff'},
          {id:'p1',x:10, y:160,w:140,h:55,label:'Membre 1',sublabel:'',color:'#bae6fd',textColor:'#0c4a6e'},
          {id:'p2',x:160,y:160,w:140,h:55,label:'Membre 2',sublabel:'',color:'#bae6fd',textColor:'#0c4a6e'},
          {id:'p3',x:310,y:160,w:140,h:55,label:'Membre 3',sublabel:'',color:'#bae6fd',textColor:'#0c4a6e'},
          {id:'p4',x:460,y:160,w:140,h:55,label:'Membre 4',sublabel:'',color:'#bae6fd',textColor:'#0c4a6e'},
          {id:'p5',x:610,y:160,w:140,h:55,label:'Membre 5',sublabel:'',color:'#bae6fd',textColor:'#0c4a6e'},
        ],
        edges:[
          {id:'e0',from:'p0',to:'p1'},{id:'e1',from:'p0',to:'p2'},
          {id:'e2',from:'p0',to:'p3'},{id:'e3',from:'p0',to:'p4'},{id:'e4',from:'p0',to:'p5'},
        ]
      },
      matriciel: {
        nodes:[
          {id:'m0',x:310,y:10, w:160,h:60,label:'Direction Générale',sublabel:'Stratégie',color:'#0f172a',textColor:'#fff'},
          {id:'m1',x:20, y:140,w:140,h:55,label:'Dir. Technique', sublabel:'Fonction',color:'#1d4ed8',textColor:'#fff'},
          {id:'m2',x:180,y:140,w:140,h:55,label:'Dir. Marketing', sublabel:'Fonction',color:'#15803d',textColor:'#fff'},
          {id:'m3',x:340,y:140,w:140,h:55,label:'Dir. Finance',   sublabel:'Fonction',color:'#7c3aed',textColor:'#fff'},
          {id:'m4',x:500,y:140,w:140,h:55,label:'Dir. RH',        sublabel:'Fonction',color:'#c2410c',textColor:'#fff'},
          {id:'m5',x:660,y:140,w:140,h:55,label:'Chef Projet A',  sublabel:'Projet',  color:'#0369a1',textColor:'#fff'},
          {id:'m6',x:660,y:220,w:140,h:55,label:'Chef Projet B',  sublabel:'Projet',  color:'#0369a1',textColor:'#fff'},
          {id:'m7',x:20, y:290,w:130,h:50,label:'Tech/Proj.A',sublabel:'',color:'#dbeafe',textColor:'#1e3a8a'},
          {id:'m8',x:180,y:290,w:130,h:50,label:'Mktg/Proj.A',sublabel:'',color:'#dcfce7',textColor:'#14532d'},
          {id:'m9',x:340,y:290,w:130,h:50,label:'Fin./Proj.A', sublabel:'',color:'#e9d5ff',textColor:'#4c1d95'},
          {id:'mA',x:20, y:360,w:130,h:50,label:'Tech/Proj.B',sublabel:'',color:'#dbeafe',textColor:'#1e3a8a'},
          {id:'mB',x:180,y:360,w:130,h:50,label:'Mktg/Proj.B',sublabel:'',color:'#dcfce7',textColor:'#14532d'},
          {id:'mC',x:340,y:360,w:130,h:50,label:'Fin./Proj.B', sublabel:'',color:'#e9d5ff',textColor:'#4c1d95'},
        ],
        edges:[
          {id:'e0',from:'m0',to:'m1'},{id:'e1',from:'m0',to:'m2'},
          {id:'e2',from:'m0',to:'m3'},{id:'e3',from:'m0',to:'m4'},{id:'e4',from:'m0',to:'m5'},
          {id:'e5',from:'m5',to:'m6'},
          {id:'e6',from:'m1',to:'m7'},{id:'e7',from:'m2',to:'m8'},{id:'e8',from:'m3',to:'m9'},
          {id:'e9',from:'m1',to:'mA'},{id:'eA',from:'m2',to:'mB'},{id:'eB',from:'m3',to:'mC'},
          {id:'eC',from:'m5',to:'m7'},{id:'eD',from:'m5',to:'m8'},{id:'eE',from:'m5',to:'m9'},
          {id:'eF',from:'m6',to:'mA'},{id:'eG',from:'m6',to:'mB'},{id:'eH',from:'m6',to:'mC'},
        ]
      }
    };

    const tpl = T[type];
    if (!tpl) return;
    this.nodes = JSON.parse(JSON.stringify(tpl.nodes));
    this.edges = JSON.parse(JSON.stringify(tpl.edges));
    this._save(); this._renderAll();
    setTimeout(() => this.fitView(), 80);
  }

  // ── Nettoyage ─────────────────────────────────────────────
  destroy() {
    window.removeEventListener('mousemove', this._boundMove);
    window.removeEventListener('mouseup',   this._boundUp);
  }
}
