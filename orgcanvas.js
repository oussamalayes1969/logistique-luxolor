// =========================================================
// OrgCanvas — Moteur d'organigramme interactif
// Vanilla JS + SVG, zéro dépendance
//
// Structure JSON sauvegardée en DATA.orgCharts[deptId] :
// {
//   nodes: [{ id, x, y, w, h, label, sublabel, color, textColor }],
//   edges: [{ id, from, to }]
// }
// =========================================================

class OrgCanvas {

  // ── Construction ──────────────────────────────────────────
  constructor(containerId, deptId, readOnly) {
    this.containerId = containerId;
    this.deptId      = deptId;
    this.readOnly    = readOnly || false;

    // État interne
    this.nodes    = [];
    this.edges    = [];
    this.selected = null;   // id du nœud sélectionné
    this.drag     = null;   // { nodeId, ox, oy }
    this.connect  = null;   // { fromId } — connexion en cours
    this.pan      = null;   // { sx, sy, tx, ty }
    this.offset   = { x: 0, y: 0 };
    this.zoom     = 1;

    this._build();
    this._loadData();
  }

  // ── Rendu de la structure HTML du canvas ──────────────────
  _build() {
    const wrap = document.getElementById(this.containerId);
    if (!wrap) return;

    const editBar = this.readOnly ? '' : `
      <div class="oc-toolbar">
        <button class="btn oc-tbtn" onclick="window._orgCanvas.addNode()">+ Nœud</button>
        <button class="btn oc-tbtn secondary" onclick="window._orgCanvas.openTemplateModal()">📋 Modèle</button>
        <span style="flex:1"></span>
        <button class="btn oc-tbtn secondary" onclick="window._orgCanvas.fitView()">⊙ Recadrer</button>
        <button class="btn oc-tbtn secondary" onclick="window._orgCanvas.clearCanvas()">🗑 Vider</button>
        <span style="font-size:.78rem;color:#64748b;align-self:center;margin-left:4px">
          Maj+clic sur un nœud → relier | Dbl-clic → éditer | Drag → déplacer
        </span>
      </div>`;

    wrap.innerHTML = `
      ${editBar}
      <div class="oc-stage" id="${this.containerId}_stage">
        <svg class="oc-svg" id="${this.containerId}_svg"></svg>
      </div>`;

    this.stage = document.getElementById(`${this.containerId}_stage`);
    this.svg   = document.getElementById(`${this.containerId}_svg`);

    // ── Événements globaux du stage ──
    this.stage.addEventListener('mousedown', e => this._onStageDown(e));
    window.addEventListener('mousemove',     e => this._onMouseMove(e));
    window.addEventListener('mouseup',       e => this._onMouseUp(e));
    this.stage.addEventListener('wheel',     e => this._onWheel(e), { passive: false });

    // Clic vide = désélection
    this.stage.addEventListener('click', e => {
      if (e.target === this.stage || e.target === this.svg) this._deselect();
    });
  }

  // ── Chargement des données du département ─────────────────
  _loadData() {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    const saved = DATA.orgCharts[this.deptId];
    if (saved) {
      this.nodes = saved.nodes || [];
      this.edges = saved.edges || [];
    } else {
      this.nodes = [];
      this.edges = [];
    }
    this._render();
  }

  // ── Sauvegarde dans DATA ──────────────────────────────────
  _save() {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    DATA.orgCharts[this.deptId] = {
      nodes: this.nodes,
      edges: this.edges
    };
    saveData();
  }

  // ── Rendu complet (nœuds + arêtes) ───────────────────────
  _render() {
    // Supprimer les anciens nœuds HTML (pas le SVG)
    this.stage.querySelectorAll('.oc-node').forEach(n => n.remove());

    // Redimensionner le SVG
    this.svg.style.width  = '100%';
    this.svg.style.height = '100%';

    if (this.nodes.length === 0) {
      this._renderEmpty();
    } else {
      this._hideEmpty();
    }

    // Rendu des arêtes en premier (derrière les nœuds)
    this._renderEdges();

    // Rendu des nœuds
    this.nodes.forEach(n => this._renderNode(n));

    // Appliquer la transformation pan/zoom
    this._applyTransform();
  }

  _renderEmpty() {
    const dept = getDept(this.deptId) || {};
    if (!document.getElementById(`${this.containerId}_empty`)) {
      const el = document.createElement('div');
      el.id = `${this.containerId}_empty`;
      el.className = 'oc-empty';
      el.innerHTML = `
        <div style="font-size:3rem">${dept.icone || '🏢'}</div>
        <h3>Organigramme vierge — ${dept.nom || 'Département'}</h3>
        <p>Cet organigramme est vide. Commencez par ajouter un nœud<br>ou choisissez un modèle de départ.</p>
        ${this.readOnly ? '' : `
          <div style="display:flex;gap:12px;justify-content:center;margin-top:16px">
            <button class="btn" onclick="window._orgCanvas.addNode()">+ Créer le premier nœud</button>
            <button class="btn secondary" onclick="window._orgCanvas.openTemplateModal()">📋 Choisir un modèle</button>
          </div>`}
      `;
      this.stage.appendChild(el);
    }
  }

  _hideEmpty() {
    const el = document.getElementById(`${this.containerId}_empty`);
    if (el) el.remove();
  }

  // ── Rendu d'un nœud ──────────────────────────────────────
  _renderNode(node) {
    const el = document.createElement('div');
    el.className = 'oc-node' + (this.selected === node.id ? ' selected' : '');
    el.id = `ocnode_${node.id}`;
    el.style.cssText = `
      left:${node.x}px; top:${node.y}px;
      width:${node.w}px; height:${node.h}px;
      background:${node.color || '#1d4ed8'};
      color:${node.textColor || '#fff'};
    `;

    el.innerHTML = `
      <div class="oc-node-label" id="ocl_${node.id}">${node.label || 'Nouveau'}</div>
      <div class="oc-node-sub"   id="ocs_${node.id}">${node.sublabel || ''}</div>
      ${this.readOnly ? '' : `<div class="oc-node-del" onclick="window._orgCanvas.deleteNode('${node.id}')">✕</div>`}
    `;

    // Drag
    if (!this.readOnly) {
      el.addEventListener('mousedown', e => this._onNodeDown(e, node.id));
    }

    // Double-clic → édition inline
    if (!this.readOnly) {
      el.addEventListener('dblclick', e => { e.stopPropagation(); this._editNode(node.id); });
    } else {
      el.addEventListener('click', () => this._showNodeDetail(node.id));
    }

    // Sélection + connexion Maj+clic
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (e.shiftKey && this.connect) {
        this._finishConnect(node.id);
      } else if (e.shiftKey && !this.connect) {
        this._startConnect(node.id);
      } else {
        this._selectNode(node.id);
      }
    });

    this.stage.appendChild(el);

    // Resize natif CSS
    if (!this.readOnly) {
      const ro = new ResizeObserver(() => {
        const rect = el.getBoundingClientRect();
        const stageRect = this.stage.getBoundingClientRect();
        const w = Math.round(el.offsetWidth);
        const h = Math.round(el.offsetHeight);
        const nd = this.nodes.find(n => n.id === node.id);
        if (nd && (nd.w !== w || nd.h !== h)) {
          nd.w = w; nd.h = h;
          this._renderEdges();
          this._save();
        }
      });
      ro.observe(el);
    }
  }

  // ── Rendu des arêtes SVG ──────────────────────────────────
  _renderEdges() {
    this.svg.innerHTML = '';

    // Flèche marker
    this.svg.innerHTML = `
      <defs>
        <marker id="oc-arrow" markerWidth="10" markerHeight="7"
          refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/>
        </marker>
      </defs>`;

    // Ligne de connexion en cours
    if (this.connect) {
      const from = this.nodes.find(n => n.id === this.connect.fromId);
      if (from) {
        const x1 = from.x + from.w / 2;
        const y1 = from.y + from.h;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        path.setAttribute('x1', x1); path.setAttribute('y1', y1);
        path.setAttribute('x2', this.connect.mx || x1);
        path.setAttribute('y2', this.connect.my || y1 + 30);
        path.setAttribute('stroke', '#3b82f6');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '5,4');
        this.svg.appendChild(path);
      }
    }

    this.edges.forEach(edge => {
      const from = this.nodes.find(n => n.id === edge.from);
      const to   = this.nodes.find(n => n.id === edge.to);
      if (!from || !to) return;

      const x1 = from.x + from.w / 2;
      const y1 = from.y + from.h;
      const x2 = to.x + to.w / 2;
      const y2 = to.y;

      // Courbe de Bézier verticale
      const cy = (y1 + y2) / 2;
      const d  = `M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#oc-arrow)');
      path.style.cursor = 'pointer';
      path.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm('Supprimer cette connexion ?')) {
          this.edges = this.edges.filter(eg => eg.id !== edge.id);
          this._save(); this._renderEdges();
        }
      });
      this.svg.appendChild(path);
    });
  }

  // ── Sélection ─────────────────────────────────────────────
  _selectNode(id) {
    this.selected = id;
    this.stage.querySelectorAll('.oc-node').forEach(el => {
      el.classList.toggle('selected', el.id === `ocnode_${id}`);
    });
  }

  _deselect() {
    this.selected = null;
    this.connect  = null;
    this.stage.querySelectorAll('.oc-node').forEach(el => el.classList.remove('selected'));
    this._renderEdges();
  }

  // ── Connexion entre nœuds (Maj+clic) ──────────────────────
  _startConnect(fromId) {
    this.connect = { fromId, mx: 0, my: 0 };
    this._selectNode(fromId);
    this.stage.style.cursor = 'crosshair';
  }

  _finishConnect(toId) {
    if (this.connect.fromId === toId) { this.connect = null; return; }
    // Éviter doublons
    const exists = this.edges.some(
      e => e.from === this.connect.fromId && e.to === toId
    );
    if (!exists) {
      this.edges.push({ id: 'e_' + Date.now(), from: this.connect.fromId, to: toId });
      this._save();
    }
    this.connect = null;
    this.stage.style.cursor = '';
    this._renderEdges();
  }

  // ── Drag des nœuds ────────────────────────────────────────
  _onNodeDown(e, nodeId) {
    if (e.target.classList.contains('oc-node-del')) return;
    if (e.target.classList.contains('oc-node-label') && e.target.isContentEditable) return;
    e.preventDefault(); e.stopPropagation();
    const nd = this.nodes.find(n => n.id === nodeId);
    if (!nd) return;
    const stageRect = this.stage.getBoundingClientRect();
    this.drag = {
      nodeId,
      ox: (e.clientX - stageRect.left) / this.zoom - nd.x,
      oy: (e.clientY - stageRect.top)  / this.zoom - nd.y
    };
    this._selectNode(nodeId);
    this.stage.style.cursor = 'grabbing';
  }

  _onStageDown(e) {
    if (e.target !== this.stage && e.target !== this.svg) return;
    // Pan avec clic milieu ou Alt+clic gauche
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      this.pan = { sx: e.clientX, sy: e.clientY, tx: this.offset.x, ty: this.offset.y };
    }
  }

  _onMouseMove(e) {
    // Pan
    if (this.pan) {
      this.offset.x = this.pan.tx + (e.clientX - this.pan.sx);
      this.offset.y = this.pan.ty + (e.clientY - this.pan.sy);
      this._applyTransform();
      return;
    }

    // Drag nœud
    if (this.drag) {
      const nd = this.nodes.find(n => n.id === this.drag.nodeId);
      if (!nd) return;
      const stageRect = this.stage.getBoundingClientRect();
      nd.x = Math.round(((e.clientX - stageRect.left) / this.zoom - this.drag.ox));
      nd.y = Math.round(((e.clientY - stageRect.top)  / this.zoom - this.drag.oy));
      nd.x = Math.max(0, nd.x); nd.y = Math.max(0, nd.y);
      const el = document.getElementById(`ocnode_${nd.id}`);
      if (el) { el.style.left = nd.x + 'px'; el.style.top = nd.y + 'px'; }
      this._renderEdges();
      return;
    }

    // Ligne de connexion en cours
    if (this.connect) {
      const stageRect = this.stage.getBoundingClientRect();
      this.connect.mx = (e.clientX - stageRect.left) / this.zoom;
      this.connect.my = (e.clientY - stageRect.top)  / this.zoom;
      this._renderEdges();
    }
  }

  _onMouseUp(e) {
    if (this.drag) {
      this._save();
      this.drag = null;
      this.stage.style.cursor = '';
    }
    if (this.pan) { this.pan = null; }
  }

  // ── Zoom molette ──────────────────────────────────────────
  _onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.min(2, Math.max(0.3, this.zoom * delta));
    this._applyTransform();
  }

  _applyTransform() {
    const transform = `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.zoom})`;
    this.stage.querySelectorAll('.oc-node').forEach(el => {
      el.style.transformOrigin = '0 0';
      el.style.transform = `translate(${this.offset.x}px,${this.offset.y}px) scale(${this.zoom})`;
      // NB: on applique la transformation uniquement à la position calculée
    });
    // Meilleure approche : wrapper interne
    this._applyContainerTransform();
  }

  _applyContainerTransform() {
    let inner = document.getElementById(`${this.containerId}_inner`);
    if (!inner) {
      // Créer un wrapper interne pour la transformation
      inner = document.createElement('div');
      inner.id = `${this.containerId}_inner`;
      inner.className = 'oc-inner';
      // Déplacer tous les nœuds dedans
      this.stage.querySelectorAll('.oc-node').forEach(n => inner.appendChild(n));
      // Déplacer le SVG
      this.stage.appendChild(inner);
      inner.appendChild(this.svg);
    }
    inner.style.transform = `translate(${this.offset.x}px,${this.offset.y}px) scale(${this.zoom})`;
  }

  // ── Recadrage automatique ─────────────────────────────────
  fitView() {
    if (!this.nodes.length) return;
    const pad = 60;
    const minX = Math.min(...this.nodes.map(n => n.x));
    const minY = Math.min(...this.nodes.map(n => n.y));
    const maxX = Math.max(...this.nodes.map(n => n.x + n.w));
    const maxY = Math.max(...this.nodes.map(n => n.y + n.h));
    const W = this.stage.offsetWidth;
    const H = this.stage.offsetHeight;
    const scaleX = (W - pad * 2) / (maxX - minX || 1);
    const scaleY = (H - pad * 2) / (maxY - minY || 1);
    this.zoom     = Math.min(1.5, Math.min(scaleX, scaleY));
    this.offset.x = pad - minX * this.zoom;
    this.offset.y = pad - minY * this.zoom;
    this._applyContainerTransform();
  }

  // ── Édition inline double-clic ────────────────────────────
  _editNode(nodeId) {
    const nd  = this.nodes.find(n => n.id === nodeId);
    if (!nd) return;

    const labelEl = document.getElementById(`ocl_${nodeId}`);
    const subEl   = document.getElementById(`ocs_${nodeId}`);

    const makeEditable = (el, field) => {
      el.contentEditable = 'true';
      el.focus();
      // Sélectionner tout le texte
      const range = document.createRange();
      range.selectNodeContents(el);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);

      const commit = () => {
        el.contentEditable = 'false';
        nd[field] = el.textContent.trim() || nd[field];
        this._save();
      };
      el.addEventListener('blur',  commit, { once: true });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { e.preventDefault(); el.blur(); }
        if (e.key === 'Escape') { el.textContent = nd[field]; el.blur(); }
      }, { once: true });
    };

    makeEditable(labelEl, 'label');

    // Après validation du label, proposer le sous-titre
    labelEl.addEventListener('blur', () => {
      setTimeout(() => makeEditable(subEl, 'sublabel'), 50);
    }, { once: true });
  }

  // ── Détail nœud (mode lecture) ────────────────────────────
  _showNodeDetail(nodeId) {
    const nd = this.nodes.find(n => n.id === nodeId);
    if (!nd) return;
    // Chercher l'employé correspondant si lié
    if (nd.empId) {
      openEmployeDetail(nd.empId);
    }
  }

  // ── Palette couleurs ──────────────────────────────────────
  _colorPicker(nodeId) {
    const nd = this.nodes.find(n => n.id === nodeId);
    if (!nd) return;
    const colors = [
      ['#1d4ed8','#fff'],['#15803d','#fff'],['#7c3aed','#fff'],
      ['#c2410c','#fff'],['#0f172a','#fff'],['#0369a1','#fff'],
      ['#be185d','#fff'],['#a16207','#fff'],['#ffffff','#1e293b'],
      ['#f1f5f9','#1e293b'],['#dbeafe','#1e3a8a'],['#dcfce7','#14532d']
    ];
    // Panel couleurs inline
    const el = document.getElementById(`ocnode_${nodeId}`);
    const existing = document.getElementById('oc-color-panel');
    if (existing) existing.remove();
    const panel = document.createElement('div');
    panel.id = 'oc-color-panel';
    panel.className = 'oc-color-panel';
    panel.innerHTML = colors.map(([bg, tc]) =>
      `<div class="oc-color-swatch" style="background:${bg};border:2px solid ${tc==='#fff'?'rgba(0,0,0,.1)':'#cbd5e1'}"
        onclick="window._orgCanvas._applyColor('${nodeId}','${bg}','${tc}')"></div>`
    ).join('');
    el.appendChild(panel);
    setTimeout(() => document.addEventListener('click', () => panel.remove(), { once: true }), 50);
  }

  _applyColor(nodeId, bg, tc) {
    const nd = this.nodes.find(n => n.id === nodeId);
    if (!nd) return;
    nd.color = bg; nd.textColor = tc;
    const el = document.getElementById(`ocnode_${nodeId}`);
    if (el) { el.style.background = bg; el.style.color = tc; }
    this._save();
    document.getElementById('oc-color-panel')?.remove();
  }

  // ── Ajouter un nœud ──────────────────────────────────────
  addNode(opts = {}) {
    this._hideEmpty();
    const node = {
      id:        'n_' + Date.now(),
      x:         opts.x || 100 + this.nodes.length * 20,
      y:         opts.y || 100 + this.nodes.length * 20,
      w:         opts.w || 180,
      h:         opts.h || 70,
      label:     opts.label    || 'Nouveau poste',
      sublabel:  opts.sublabel || 'Service',
      color:     opts.color    || '#1d4ed8',
      textColor: opts.textColor || '#fff'
    };
    this.nodes.push(node);
    this._renderNode(node);
    this._save();
    // Édition immédiate si nouveau nœud vide
    if (!opts.label) setTimeout(() => this._editNode(node.id), 80);
    return node;
  }

  // ── Supprimer un nœud ────────────────────────────────────
  deleteNode(nodeId) {
    if (!confirm('Supprimer ce nœud et ses connexions ?')) return;
    this.nodes  = this.nodes.filter(n => n.id !== nodeId);
    this.edges  = this.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    if (this.selected === nodeId) this.selected = null;
    document.getElementById(`ocnode_${nodeId}`)?.remove();
    this._renderEdges();
    this._save();
    if (!this.nodes.length) this._renderEmpty();
  }

  // ── Vider le canvas ───────────────────────────────────────
  clearCanvas() {
    if (!confirm('Vider complètement cet organigramme ?')) return;
    this.nodes = []; this.edges = [];
    this._save(); this._render();
  }

  // ── Templates ─────────────────────────────────────────────
  openTemplateModal() {
    const body = document.getElementById('employeFormBody');
    body.innerHTML = `
      <h2>📋 Choisir un modèle de départ</h2>
      <p style="color:#64748b;font-size:.88rem">Le modèle remplacera l'organigramme actuel du département.</p>
      <div class="oc-template-grid">
        ${this._templateCard('standard', '🏢', 'Standard Pyramidal',
          'Directeur → Managers → Agents<br>Structure hiérarchique classique')}
        ${this._templateCard('logistique', '🏭', 'Logistique',
          'Directeur → 4 pôles :<br>Dépôt · Vente · Admin · Stock')}
        ${this._templateCard('commercial', '💼', 'Commercial',
          'Directeur Commercial → Chef des ventes → Équipes régionales')}
        ${this._templateCard('plat', '◼◼', 'Organisation Plate',
          'Un responsable unique avec toute l'équipe en parallèle')}
        ${this._templateCard('matriciel', '⊞', 'Matriciel',
          'Structure croisée : projets × fonctions')}
      </div>
      <div class="modal-actions" style="margin-top:16px">
        <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
      </div>`;
    openModal('employeFormModal');
  }

  _templateCard(type, icon, title, desc) {
    return `<div class="oc-template-card" onclick="window._orgCanvas.loadTemplate('${type}')">
      <div class="oc-tpl-icon">${icon}</div>
      <div class="oc-tpl-name">${title}</div>
      <div class="oc-tpl-desc">${desc}</div>
    </div>`;
  }

  loadTemplate(type) {
    if (this.nodes.length && !confirm('Remplacer l\'organigramme actuel par ce modèle ?')) return;
    closeAllModals();

    const TEMPLATES = {

      // ── Template Standard ──────────────────────────────────
      standard: {
        nodes: [
          { id:'t0', x:310, y:30,  w:180, h:65, label:'Directeur Général',    sublabel:'Direction',       color:'#1d4ed8', textColor:'#fff' },
          { id:'t1', x:80,  y:160, w:170, h:60, label:'Manager Opérations',   sublabel:'Opérations',      color:'#2563eb', textColor:'#fff' },
          { id:'t2', x:310, y:160, w:170, h:60, label:'Manager Commercial',   sublabel:'Commercial',      color:'#2563eb', textColor:'#fff' },
          { id:'t3', x:540, y:160, w:170, h:60, label:'Manager RH',           sublabel:'Ressources Humaines', color:'#2563eb', textColor:'#fff' },
          { id:'t4', x:20,  y:290, w:145, h:55, label:'Agent Op. 1',          sublabel:'Opérations',      color:'#bfdbfe', textColor:'#1e3a8a' },
          { id:'t5', x:175, y:290, w:145, h:55, label:'Agent Op. 2',          sublabel:'Opérations',      color:'#bfdbfe', textColor:'#1e3a8a' },
          { id:'t6', x:260, y:290, w:145, h:55, label:'Commercial 1',         sublabel:'Commercial',      color:'#bfdbfe', textColor:'#1e3a8a' },
          { id:'t7', x:415, y:290, w:145, h:55, label:'Commercial 2',         sublabel:'Commercial',      color:'#bfdbfe', textColor:'#1e3a8a' },
          { id:'t8', x:540, y:290, w:145, h:55, label:'RH Recrutement',       sublabel:'RH',              color:'#bfdbfe', textColor:'#1e3a8a' },
          { id:'t9', x:695, y:290, w:145, h:55, label:'RH Formation',         sublabel:'RH',              color:'#bfdbfe', textColor:'#1e3a8a' },
        ],
        edges: [
          {id:'e0',from:'t0',to:'t1'},{id:'e1',from:'t0',to:'t2'},{id:'e2',from:'t0',to:'t3'},
          {id:'e3',from:'t1',to:'t4'},{id:'e4',from:'t1',to:'t5'},
          {id:'e5',from:'t2',to:'t6'},{id:'e6',from:'t2',to:'t7'},
          {id:'e7',from:'t3',to:'t8'},{id:'e8',from:'t3',to:'t9'},
        ]
      },

      // ── Template Logistique ────────────────────────────────
      logistique: {
        nodes: [
          { id:'l0', x:300, y:20,  w:200, h:70, label:'Directeur Logistique', sublabel:'Direction',          color:'#0f172a', textColor:'#fff' },
          { id:'l1', x:20,  y:160, w:185, h:60, label:'Resp. Dépôt Central',  sublabel:'Dépôt Central',      color:'#1d4ed8', textColor:'#fff' },
          { id:'l2', x:225, y:160, w:185, h:60, label:'Resp. Vente en ligne', sublabel:'Vente en ligne',     color:'#15803d', textColor:'#fff' },
          { id:'l3', x:430, y:160, w:185, h:60, label:'Resp. Administratif',  sublabel:'Administratif',      color:'#7c3aed', textColor:'#fff' },
          { id:'l4', x:635, y:160, w:185, h:60, label:'Gestionnaire Stock',   sublabel:'Gestion des stocks', color:'#c2410c', textColor:'#fff' },
          { id:'l5', x:20,  y:290, w:175, h:50, label:'Agents Dépôt (×12)',   sublabel:'Dépôt Central',      color:'#bfdbfe', textColor:'#1e3a8a' },
          { id:'l6', x:225, y:290, w:175, h:50, label:'Agents Vente (×7)',    sublabel:'Vente en ligne',     color:'#bbf7d0', textColor:'#14532d' },
          { id:'l7', x:430, y:290, w:175, h:50, label:'Administratifs (×3)',  sublabel:'Administratif',      color:'#e9d5ff', textColor:'#4c1d95' },
          { id:'l8', x:635, y:290, w:175, h:50, label:'Agents Stock (×2)',    sublabel:'Gestion des stocks', color:'#fed7aa', textColor:'#7c2d12' },
        ],
        edges: [
          {id:'e0',from:'l0',to:'l1'},{id:'e1',from:'l0',to:'l2'},
          {id:'e2',from:'l0',to:'l3'},{id:'e3',from:'l0',to:'l4'},
          {id:'e4',from:'l1',to:'l5'},{id:'e5',from:'l2',to:'l6'},
          {id:'e6',from:'l3',to:'l7'},{id:'e7',from:'l4',to:'l8'},
        ]
      },

      // ── Template Commercial ────────────────────────────────
      commercial: {
        nodes: [
          { id:'c0', x:280, y:20,  w:200, h:70, label:'Directeur Commercial', sublabel:'Direction',        color:'#c2410c', textColor:'#fff' },
          { id:'c1', x:100, y:160, w:180, h:60, label:'Chef des Ventes Nord', sublabel:'Zone Nord',        color:'#ea580c', textColor:'#fff' },
          { id:'c2', x:420, y:160, w:180, h:60, label:'Chef des Ventes Sud',  sublabel:'Zone Sud',         color:'#ea580c', textColor:'#fff' },
          { id:'c3', x:40,  y:290, w:160, h:55, label:'Commercial 1',         sublabel:'Zone Nord',        color:'#fed7aa', textColor:'#7c2d12' },
          { id:'c4', x:210, y:290, w:160, h:55, label:'Commercial 2',         sublabel:'Zone Nord',        color:'#fed7aa', textColor:'#7c2d12' },
          { id:'c5', x:360, y:290, w:160, h:55, label:'Commercial 3',         sublabel:'Zone Sud',         color:'#fed7aa', textColor:'#7c2d12' },
          { id:'c6', x:530, y:290, w:160, h:55, label:'Commercial 4',         sublabel:'Zone Sud',         color:'#fed7aa', textColor:'#7c2d12' },
          { id:'c7', x:680, y:160, w:180, h:60, label:'Responsable ADV',      sublabel:'Admin. des ventes',color:'#ea580c', textColor:'#fff' },
          { id:'c8', x:680, y:290, w:160, h:55, label:'Assistante ADV',       sublabel:'Admin. des ventes',color:'#fed7aa', textColor:'#7c2d12' },
        ],
        edges: [
          {id:'e0',from:'c0',to:'c1'},{id:'e1',from:'c0',to:'c2'},{id:'e2',from:'c0',to:'c7'},
          {id:'e3',from:'c1',to:'c3'},{id:'e4',from:'c1',to:'c4'},
          {id:'e5',from:'c2',to:'c5'},{id:'e6',from:'c2',to:'c6'},
          {id:'e7',from:'c7',to:'c8'},
        ]
      },

      // ── Template Plat ──────────────────────────────────────
      plat: {
        nodes: [
          { id:'p0', x:280, y:20,  w:200, h:70, label:'Responsable d\'équipe', sublabel:'Direction',  color:'#0369a1', textColor:'#fff' },
          { id:'p1', x:20,  y:160, w:155, h:55, label:'Membre 1', sublabel:'Équipe', color:'#bae6fd', textColor:'#0c4a6e' },
          { id:'p2', x:185, y:160, w:155, h:55, label:'Membre 2', sublabel:'Équipe', color:'#bae6fd', textColor:'#0c4a6e' },
          { id:'p3', x:350, y:160, w:155, h:55, label:'Membre 3', sublabel:'Équipe', color:'#bae6fd', textColor:'#0c4a6e' },
          { id:'p4', x:515, y:160, w:155, h:55, label:'Membre 4', sublabel:'Équipe', color:'#bae6fd', textColor:'#0c4a6e' },
          { id:'p5', x:680, y:160, w:155, h:55, label:'Membre 5', sublabel:'Équipe', color:'#bae6fd', textColor:'#0c4a6e' },
        ],
        edges: [
          {id:'e0',from:'p0',to:'p1'},{id:'e1',from:'p0',to:'p2'},{id:'e2',from:'p0',to:'p3'},
          {id:'e3',from:'p0',to:'p4'},{id:'e4',from:'p0',to:'p5'},
        ]
      },

      // ── Template Matriciel ─────────────────────────────────
      matriciel: {
        nodes: [
          { id:'m0', x:320, y:20,  w:160, h:60, label:'DG / Direction', sublabel:'Stratégie', color:'#0f172a', textColor:'#fff' },
          // Fonctionnel (colonnes)
          { id:'m1', x:20,  y:150, w:140, h:55, label:'Dir. Technique',  sublabel:'Fonction', color:'#1d4ed8', textColor:'#fff' },
          { id:'m2', x:180, y:150, w:140, h:55, label:'Dir. Marketing',  sublabel:'Fonction', color:'#15803d', textColor:'#fff' },
          { id:'m3', x:340, y:150, w:140, h:55, label:'Dir. Finance',    sublabel:'Fonction', color:'#7c3aed', textColor:'#fff' },
          { id:'m4', x:500, y:150, w:140, h:55, label:'Dir. RH',         sublabel:'Fonction', color:'#c2410c', textColor:'#fff' },
          // Projets (lignes)
          { id:'m5', x:660, y:150, w:140, h:55, label:'Chef Projet A',   sublabel:'Projet',   color:'#0369a1', textColor:'#fff' },
          { id:'m6', x:660, y:225, w:140, h:55, label:'Chef Projet B',   sublabel:'Projet',   color:'#0369a1', textColor:'#fff' },
          // Intersections
          { id:'m7', x:20,  y:280, w:130, h:50, label:'Tech/Proj.A', sublabel:'', color:'#dbeafe', textColor:'#1e3a8a' },
          { id:'m8', x:180, y:280, w:130, h:50, label:'Mktg/Proj.A', sublabel:'', color:'#dcfce7', textColor:'#14532d' },
          { id:'m9', x:340, y:280, w:130, h:50, label:'Fin./Proj.A',  sublabel:'', color:'#e9d5ff', textColor:'#4c1d95' },
          { id:'mA', x:20,  y:350, w:130, h:50, label:'Tech/Proj.B', sublabel:'', color:'#dbeafe', textColor:'#1e3a8a' },
          { id:'mB', x:180, y:350, w:130, h:50, label:'Mktg/Proj.B', sublabel:'', color:'#dcfce7', textColor:'#14532d' },
          { id:'mC', x:340, y:350, w:130, h:50, label:'Fin./Proj.B',  sublabel:'', color:'#e9d5ff', textColor:'#4c1d95' },
        ],
        edges: [
          {id:'e0',from:'m0',to:'m1'},{id:'e1',from:'m0',to:'m2'},{id:'e2',from:'m0',to:'m3'},
          {id:'e3',from:'m0',to:'m4'},{id:'e4',from:'m0',to:'m5'},{id:'e5',from:'m5',to:'m6'},
          {id:'e6',from:'m1',to:'m7'},{id:'e7',from:'m2',to:'m8'},{id:'e8',from:'m3',to:'m9'},
          {id:'e9',from:'m1',to:'mA'},{id:'eA',from:'m2',to:'mB'},{id:'eB',from:'m3',to:'mC'},
          {id:'eC',from:'m5',to:'m7'},{id:'eD',from:'m5',to:'m8'},{id:'eE',from:'m5',to:'m9'},
          {id:'eF',from:'m6',to:'mA'},{id:'eG',from:'m6',to:'mB'},{id:'eH',from:'m6',to:'mC'},
        ]
      }
    };

    const tpl = TEMPLATES[type];
    if (!tpl) return;
    this.nodes = JSON.parse(JSON.stringify(tpl.nodes));
    this.edges = JSON.parse(JSON.stringify(tpl.edges));
    this._save();
    this._render();
    setTimeout(() => this.fitView(), 100);
  }

  // ── Nettoyage (changement de département) ─────────────────
  destroy() {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup',   this._onMouseUp);
  }
}
