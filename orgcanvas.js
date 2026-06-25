// =========================================================
// OrgCanvas — Moteur GoJS (production-grade)
// Drag & Drop natif · Resize · Edition inline · Sidebar
// Chargé via CDN : go.js (Apache 2.0 — watermark evaluation)
// =========================================================

// ── Templates de départ ───────────────────────────────────────
const TEMPLATES_CONFIG = {

  standard: {
    label: '🏢 Standard Pyramidal',
    nodes: [
      { key:1,  label:'Directeur Général',       sublabel:'Direction',        color:'#0f172a', textColor:'#ffffff', w:200, h:72 },
      { key:2,  label:'Directeur Opérations',    sublabel:'Opérations',       color:'#1d4ed8', textColor:'#ffffff', w:185, h:65 },
      { key:3,  label:'Directeur Commercial',    sublabel:'Commercial',       color:'#1d4ed8', textColor:'#ffffff', w:185, h:65 },
      { key:4,  label:'Manager Op. Nord',        sublabel:'Zone Nord',        color:'#3b82f6', textColor:'#ffffff', w:170, h:60 },
      { key:5,  label:'Manager Op. Sud',         sublabel:'Zone Sud',         color:'#3b82f6', textColor:'#ffffff', w:170, h:60 },
      { key:6,  label:'Manager Commercial A',    sublabel:'Zone A',           color:'#3b82f6', textColor:'#ffffff', w:170, h:60 },
      { key:7,  label:'Manager Commercial B',    sublabel:'Zone B',           color:'#3b82f6', textColor:'#ffffff', w:170, h:60 },
    ],
    edges: [
      { from:1, to:2 }, { from:1, to:3 },
      { from:2, to:4 }, { from:2, to:5 },
      { from:3, to:6 }, { from:3, to:7 },
    ]
  },

  logistique: {
    label: '🏭 Logistique Supply Chain',
    nodes: [
      { key:1,  label:'Directeur Logistique',      sublabel:'Oussama Layes',        color:'#0f172a', textColor:'#ffffff', w:220, h:72 },
      { key:2,  label:'Resp. Dépôt Central',       sublabel:'Zied Graf',            color:'#1d4ed8', textColor:'#ffffff', w:190, h:65 },
      { key:3,  label:'Resp. Vente en ligne',      sublabel:'À nommer',             color:'#15803d', textColor:'#ffffff', w:190, h:65 },
      { key:4,  label:'Resp. Administratif',       sublabel:'Omar Dhamna',          color:'#7c3aed', textColor:'#ffffff', w:190, h:65 },
      { key:5,  label:'Gestionnaire Stock',        sublabel:'Houcem Charfi',        color:'#c2410c', textColor:'#ffffff', w:190, h:65 },
      { key:6,  label:'Agents Dépôt (×12)',        sublabel:'Dépôt Central',        color:'#bfdbfe', textColor:'#1e3a8a', w:175, h:55 },
      { key:7,  label:'Préparateurs Vente (×7)',   sublabel:'Vente en ligne',       color:'#bbf7d0', textColor:'#14532d', w:175, h:55 },
      { key:8,  label:'Administratifs (×3)',       sublabel:'Administratif',        color:'#e9d5ff', textColor:'#4c1d95', w:175, h:55 },
      { key:9,  label:'Agents Stock (×2)',         sublabel:'Gestion des stocks',   color:'#fed7aa', textColor:'#7c2d12', w:175, h:55 },
    ],
    edges: [
      { from:1, to:2 }, { from:1, to:3 }, { from:1, to:4 }, { from:1, to:5 },
      { from:2, to:6 }, { from:3, to:7 }, { from:4, to:8 }, { from:5, to:9 },
    ]
  },

  commercial: {
    label: '💼 Commercial & Ventes',
    nodes: [
      { key:1, label:'Directeur Commercial',   sublabel:'Direction',      color:'#c2410c', textColor:'#ffffff', w:200, h:72 },
      { key:2, label:'Chef des Ventes Nord',   sublabel:'Zone Nord',      color:'#ea580c', textColor:'#ffffff', w:185, h:65 },
      { key:3, label:'Chef des Ventes Sud',    sublabel:'Zone Sud',       color:'#ea580c', textColor:'#ffffff', w:185, h:65 },
      { key:4, label:'Responsable ADV',        sublabel:'Admin. Ventes',  color:'#ea580c', textColor:'#ffffff', w:185, h:65 },
      { key:5, label:'Commercial 1',           sublabel:'Zone Nord',      color:'#fed7aa', textColor:'#7c2d12', w:160, h:55 },
      { key:6, label:'Commercial 2',           sublabel:'Zone Nord',      color:'#fed7aa', textColor:'#7c2d12', w:160, h:55 },
      { key:7, label:'Commercial 3',           sublabel:'Zone Sud',       color:'#fed7aa', textColor:'#7c2d12', w:160, h:55 },
      { key:8, label:'Commercial 4',           sublabel:'Zone Sud',       color:'#fed7aa', textColor:'#7c2d12', w:160, h:55 },
      { key:9, label:'Assistante ADV',         sublabel:'Admin. Ventes',  color:'#fed7aa', textColor:'#7c2d12', w:160, h:55 },
    ],
    edges: [
      { from:1, to:2 }, { from:1, to:3 }, { from:1, to:4 },
      { from:2, to:5 }, { from:2, to:6 },
      { from:3, to:7 }, { from:3, to:8 },
      { from:4, to:9 },
    ]
  },

  rh: {
    label: '👥 Ressources Humaines',
    nodes: [
      { key:1, label:'DRH',                  sublabel:'Direction RH',       color:'#7c3aed', textColor:'#ffffff', w:190, h:70 },
      { key:2, label:'Resp. Recrutement',    sublabel:'Recrutement',        color:'#8b5cf6', textColor:'#ffffff', w:175, h:62 },
      { key:3, label:'Resp. Formation',      sublabel:'Formation',          color:'#8b5cf6', textColor:'#ffffff', w:175, h:62 },
      { key:4, label:'Resp. Paie & Admin',   sublabel:'Paie & Admin.',      color:'#8b5cf6', textColor:'#ffffff', w:175, h:62 },
      { key:5, label:'Chargé Recrutement',   sublabel:'',                   color:'#e9d5ff', textColor:'#4c1d95', w:160, h:52 },
      { key:6, label:'Chargé Formation',     sublabel:'',                   color:'#e9d5ff', textColor:'#4c1d95', w:160, h:52 },
      { key:7, label:'Gestionnaire Paie',    sublabel:'',                   color:'#e9d5ff', textColor:'#4c1d95', w:160, h:52 },
    ],
    edges: [
      { from:1, to:2 }, { from:1, to:3 }, { from:1, to:4 },
      { from:2, to:5 }, { from:3, to:6 }, { from:4, to:7 },
    ]
  }
};

// ── Classe principale ─────────────────────────────────────────
class OrgCanvas {

  constructor(containerId, deptId, readOnly) {
    this.containerId = containerId;
    this.deptId      = deptId;
    this.readOnly    = readOnly || false;
    this.diagram     = null;
    this._sidebarNode = null;

    if (typeof go === 'undefined') {
      this._showGoJSError(); return;
    }
    this._buildDOM();
    this._initGoJS();
    this._loadFromData();
  }

  // ── Erreur si GoJS non chargé ─────────────────────────────
  _showGoJSError() {
    const wrap = document.getElementById(this.containerId);
    if (wrap) wrap.innerHTML = `
      <div style="padding:40px;text-align:center;color:#dc2626">
        <h3>⚠ GoJS non chargé</h3>
        <p>Vérifiez votre connexion internet — GoJS se charge via CDN.</p>
      </div>`;
  }

  // ── Construction du DOM ───────────────────────────────────
  _buildDOM() {
    const wrap = document.getElementById(this.containerId);
    if (!wrap) return;

    const ro = this.readOnly;
    const p  = this.containerId;

    wrap.innerHTML = `
      <!-- Toolbar -->
      <div class="oc-toolbar" style="${ro ? 'display:none' : ''}">
        <button class="btn oc-tbtn" id="${p}_btn_add">＋ Nouveau rôle</button>
        <button class="btn oc-tbtn secondary" id="${p}_btn_tpl">📋 Modèle</button>
        <span style="flex:1"></span>
        <button class="btn oc-tbtn secondary" id="${p}_btn_fit">⊙ Recadrer</button>
        <button class="btn oc-tbtn secondary" id="${p}_btn_undo">↩ Annuler</button>
        <button class="btn oc-tbtn secondary" id="${p}_btn_del">🗑 Supprimer nœud</button>
        <span class="oc-hint">Drag bord bleu = connecter · Dbl-clic = éditer texte · Poignée = resize</span>
      </div>

      <!-- Zone principale : canvas + sidebar -->
      <div class="oc-main">

        <!-- Canvas GoJS -->
        <div id="${p}_canvas" class="oc-gojs-canvas"></div>

        <!-- Canvas vide (masqué si données) -->
        <div class="oc-empty" id="${p}_empty">
          <div style="font-size:3rem">🏢</div>
          <h3>Organigramme vide</h3>
          <p>Créez un premier rôle ou choisissez un modèle de départ.</p>
          ${ro ? '' : `
            <div style="display:flex;gap:12px;margin-top:16px">
              <button class="btn" id="${p}_empty_add">＋ Créer le premier rôle</button>
              <button class="btn secondary" id="${p}_empty_tpl">📋 Choisir un modèle</button>
            </div>`}
        </div>

        <!-- Sidebar propriétés (masquée par défaut) -->
        <div class="oc-sidebar" id="${p}_sidebar" style="display:none">
          <div class="oc-sb-header">
            <span>✏ Propriétés</span>
            <button class="oc-sb-close" id="${p}_sb_close">✕</button>
          </div>
          <div class="oc-sb-body">
            <label class="oc-sb-label">Nom / Rôle</label>
            <input class="oc-sb-input" id="${p}_sb_label" placeholder="Ex: Directeur Général">
            <label class="oc-sb-label">Sous-titre / Service</label>
            <input class="oc-sb-input" id="${p}_sb_sub" placeholder="Ex: Direction Générale">
            <label class="oc-sb-label">Couleur de fond</label>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
              <input type="color" id="${p}_sb_color" style="width:44px;height:36px;border-radius:6px;border:1px solid #e2e8f0;cursor:pointer">
              <div class="oc-color-presets" id="${p}_sb_presets"></div>
            </div>
            <label class="oc-sb-label">Couleur du texte</label>
            <div style="display:flex;gap:8px;margin-bottom:14px">
              <button class="oc-txt-btn active" id="${p}_sb_txtw" data-tc="#ffffff">Blanc</button>
              <button class="oc-txt-btn"        id="${p}_sb_txtd" data-tc="#1e293b">Sombre</button>
            </div>
            <button class="btn" id="${p}_sb_apply" style="width:100%;margin-bottom:8px">✓ Appliquer</button>
            <button class="btn danger" id="${p}_sb_del" style="width:100%">🗑 Supprimer ce nœud</button>
          </div>
        </div>
      </div>`;

    // Palette de couleurs prédéfinies
    const presets = ['#0f172a','#1d4ed8','#15803d','#7c3aed','#c2410c',
                     '#0369a1','#be185d','#a16207','#334155','#374151'];
    const presetsEl = document.getElementById(`${p}_sb_presets`);
    if (presetsEl) {
      presetsEl.innerHTML = presets.map(c =>
        `<div class="oc-color-swatch" style="background:${c}"
          onclick="document.getElementById('${p}_sb_color').value='${c}'"></div>`
      ).join('');
    }
  }

  // ── Initialisation GoJS ───────────────────────────────────
  _initGoJS() {
    const $ = go.GraphObject.make;
    const p = this.containerId;
    const ro = this.readOnly;

    // ── Diagramme ──
    this.diagram = $(go.Diagram, `${p}_canvas`, {
      'undoManager.isEnabled': true,
      isReadOnly: ro,
      allowDelete: !ro,
      allowCopy: !ro,
      // Layout automatique si demandé
      layout: $(go.TreeLayout, {
        angle: 90,
        layerSpacing: 55,
        nodeSpacing: 18,
        isInitial: false,   // Ne pas relayout à chaque modèle change
        isOngoing: false
      }),
      // Sauvegarder après chaque transaction
      'ModelChanged': e => { if (e.isTransactionFinished) this._save(); },
      // Sidebar lors de sélection
      'ChangedSelection': () => this._onSelectionChanged()
    });

    // ── Template des nœuds ──
    this.diagram.nodeTemplate = $(go.Node, 'Spot',
      {
        locationSpot: go.Spot.Center,
        resizable: !ro,
        resizeObjectName: 'BODY',
        selectionAdornmentTemplate: $(go.Adornment, 'Auto',
          $(go.Shape, 'RoundedRectangle',
            { fill: null, stroke: '#fbbf24', strokeWidth: 3, parameter1: 10 }
          ),
          $(go.Placeholder)
        ),
        // Port de connexion haut (entrée) et bas (sortie)
        fromSpot: go.Spot.Bottom,
        toSpot: go.Spot.Top,
        fromLinkable: !ro,
        toLinkable: !ro,
        cursor: 'move',
        toolTip: $(go.Adornment, 'Auto',
          $(go.Shape, { fill: '#1e293b' }),
          $(go.TextBlock, { stroke: '#fff', margin: 6, font: '12px Segoe UI' },
            new go.Binding('text', 'label')
          )
        )
      },
      // Corps du nœud
      $(go.Panel, 'Auto',
        {
          name: 'BODY',
          minSize: new go.Size(140, 55)
        },
        new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
        $(go.Shape, 'RoundedRectangle',
          {
            strokeWidth: 0,
            fill: '#1d4ed8',
            parameter1: 10,
            shadowVisible: true,
            shadowColor: 'rgba(0,0,0,0.18)',
            shadowOffset: new go.Point(0, 4),
            shadowBlur: 12
          },
          new go.Binding('fill', 'color')
        ),
        $(go.Panel, 'Vertical',
          { padding: new go.Margin(10, 16), alignment: go.Spot.Center },
          // Ligne 1 : nom / rôle
          $(go.TextBlock,
            {
              name: 'LABEL',
              font: 'bold 13px "Segoe UI", Arial, sans-serif',
              stroke: '#ffffff',
              editable: !ro,
              isMultiline: false,
              overflow: go.TextBlock.OverflowEllipsis,
              textAlign: 'center',
              maxSize: new go.Size(220, NaN)
            },
            new go.Binding('text', 'label').makeTwoWay(),
            new go.Binding('stroke', 'textColor').makeTwoWay()
          ),
          // Ligne 2 : sous-titre
          $(go.TextBlock,
            {
              font: '11px "Segoe UI", Arial, sans-serif',
              stroke: 'rgba(255,255,255,0.78)',
              editable: !ro,
              isMultiline: false,
              overflow: go.TextBlock.OverflowEllipsis,
              textAlign: 'center',
              margin: new go.Margin(3, 0, 0, 0),
              maxSize: new go.Size(220, NaN)
            },
            new go.Binding('text', 'sublabel').makeTwoWay(),
            new go.Binding('stroke', 'textColor',
              tc => tc === '#1e293b' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)'
            )
          )
        )
      ),
      // Port visible en bas (pour glisser une connexion)
      $(go.Shape, 'Circle',
        {
          width: 14, height: 14,
          fill: '#fff', stroke: '#3b82f6', strokeWidth: 2,
          portId: 'out',
          fromLinkable: !ro,
          cursor: 'crosshair',
          alignment: go.Spot.Bottom,
          alignmentFocus: go.Spot.Top
        }
      )
    );

    // ── Template des liens ──
    this.diagram.linkTemplate = $(go.Link,
      {
        routing: go.Link.Orthogonal,
        corner: 8,
        curve: go.Link.JumpOver,
        relinkableFrom: !ro,
        relinkableTo: !ro,
        reshapable: !ro,
        selectionAdornmentTemplate: $(go.Adornment,
          $(go.Shape, { isPanelMain: true, stroke: '#3b82f6', strokeWidth: 3 })
        )
      },
      $(go.Shape, { strokeWidth: 2, stroke: '#94a3b8' }),
      $(go.Shape, { toArrow: 'OpenTriangle', stroke: '#94a3b8', strokeWidth: 2 })
    );

    // ── Lier les boutons ──
    if (!ro) {
      document.getElementById(`${p}_btn_add`)?.addEventListener('click',  () => this.addNode());
      document.getElementById(`${p}_btn_tpl`)?.addEventListener('click',  () => this.openTemplates());
      document.getElementById(`${p}_btn_fit`)?.addEventListener('click',  () => this.fitView());
      document.getElementById(`${p}_btn_undo`)?.addEventListener('click', () => this.diagram.commandHandler.undo());
      document.getElementById(`${p}_btn_del`)?.addEventListener('click',  () => this._deleteSelected());
      document.getElementById(`${p}_empty_add`)?.addEventListener('click',() => this.addNode());
      document.getElementById(`${p}_empty_tpl`)?.addEventListener('click',() => this.openTemplates());
      this._bindSidebar();
    }
  }

  // ── Sidebar : bindings ────────────────────────────────────
  _bindSidebar() {
    const p  = this.containerId;
    const sb = id => document.getElementById(`${p}_${id}`);

    // Bouton Appliquer
    sb('sb_apply')?.addEventListener('click', () => {
      const node = this.diagram.selection.first();
      if (!node || !(node instanceof go.Node)) return;
      const tc = sb('sb_txtw').classList.contains('active') ? '#ffffff' : '#1e293b';
      this.diagram.model.startTransaction('edit node');
      this.diagram.model.setDataProperty(node.data, 'label',     sb('sb_label').value.trim());
      this.diagram.model.setDataProperty(node.data, 'sublabel',  sb('sb_sub').value.trim());
      this.diagram.model.setDataProperty(node.data, 'color',     sb('sb_color').value);
      this.diagram.model.setDataProperty(node.data, 'textColor', tc);
      this.diagram.model.commitTransaction('edit node');
    });

    // Bouton Supprimer
    sb('sb_del')?.addEventListener('click', () => {
      if (!confirm('Supprimer ce nœud et ses connexions ?')) return;
      this._deleteSelected();
      sb('sidebar').style.display = 'none';
    });

    // Fermer sidebar
    sb('sb_close')?.addEventListener('click', () => {
      sb('sidebar').style.display = 'none';
      this.diagram.clearSelection();
    });

    // Boutons texte blanc / sombre
    [sb('sb_txtw'), sb('sb_txtd')].forEach(btn => {
      btn?.addEventListener('click', () => {
        sb('sb_txtw').classList.toggle('active', btn === sb('sb_txtw'));
        sb('sb_txtd').classList.toggle('active', btn === sb('sb_txtd'));
      });
    });
  }

  // ── Mise à jour de la sidebar lors d'une sélection ────────
  _onSelectionChanged() {
    const p  = this.containerId;
    const sb = id => document.getElementById(`${p}_${id}`);
    const node = this.diagram.selection.first();

    if (node instanceof go.Node) {
      sb('sidebar').style.display = 'flex';
      sb('sb_label').value  = node.data.label    || '';
      sb('sb_sub').value    = node.data.sublabel  || '';
      sb('sb_color').value  = node.data.color     || '#1d4ed8';
      const isDark = (node.data.textColor || '#ffffff') === '#1e293b';
      sb('sb_txtw').classList.toggle('active', !isDark);
      sb('sb_txtd').classList.toggle('active',  isDark);
    } else {
      sb('sidebar').style.display = 'none';
    }
  }

  // ── Supprimer le nœud sélectionné ────────────────────────
  _deleteSelected() {
    const node = this.diagram.selection.first();
    if (node instanceof go.Node) {
      this.diagram.startTransaction('delete');
      this.diagram.remove(node);
      // Supprimer les liens associés
      node.findLinksConnected().each(l => this.diagram.remove(l));
      this.diagram.commitTransaction('delete');
      this._checkEmpty();
    }
  }

  // ── Charger les données sauvegardées ─────────────────────
  _loadFromData() {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    const saved = DATA.orgCharts[this.deptId];

    if (saved && saved.nodes && saved.nodes.length > 0) {
      this._setModel(saved.nodes, saved.edges || []);
    } else {
      this._setModel([], []);
      this._showEmpty();
    }
  }

  // ── Appliquer un modèle GoJS ──────────────────────────────
  _setModel(nodes, edges) {
    if (!this.diagram) return;
    const $ = go.GraphObject.make;

    this.diagram.model = $(go.GraphLinksModel, {
      nodeKeyProperty:   'key',
      linkFromKeyProperty: 'from',
      linkToKeyProperty:   'to',
      nodeDataArray:  nodes.map(n => ({
        key:       n.key  || n.id || Math.floor(Math.random()*900000)+100000,
        label:     n.label     || 'Nouveau',
        sublabel:  n.sublabel  || '',
        color:     n.color     || '#1d4ed8',
        textColor: n.textColor || '#ffffff',
        size:      n.size      || `${n.w||180} ${n.h||65}`
      })),
      linkDataArray: edges.map(e => ({
        from: e.from,
        to:   e.to
      }))
    });

    document.getElementById(`${this.containerId}_empty`)?.style &&
      (document.getElementById(`${this.containerId}_empty`).style.display = 'none');

    // Recadrer après chargement
    setTimeout(() => this.fitView(), 120);
  }

  // ── Canvas vide ───────────────────────────────────────────
  _showEmpty() {
    const el = document.getElementById(`${this.containerId}_empty`);
    if (el) el.style.display = 'flex';
  }

  _hideEmpty() {
    const el = document.getElementById(`${this.containerId}_empty`);
    if (el) el.style.display = 'none';
  }

  _checkEmpty() {
    if (this.diagram && this.diagram.model.nodeDataArray.length === 0) {
      this._showEmpty();
    }
  }

  // ── Sauvegarder dans DATA ────────────────────────────────
  _save() {
    if (!this.diagram || !DATA) return;
    if (!DATA.orgCharts) DATA.orgCharts = {};

    const model = this.diagram.model;
    DATA.orgCharts[this.deptId] = {
      nodes: model.nodeDataArray.map(n => ({ ...n })),
      edges: model.linkDataArray.map(e => ({ from: e.from, to: e.to }))
    };
    if (typeof saveData === 'function') saveData();
  }

  // ── Ajouter un nœud vide au centre ───────────────────────
  addNode() {
    if (!this.diagram) return;
    this._hideEmpty();
    const view   = this.diagram.viewportBounds;
    const center = view.center;
    const newKey = Date.now();

    this.diagram.startTransaction('add node');
    this.diagram.model.addNodeData({
      key:       newKey,
      label:     'Nouveau rôle',
      sublabel:  'Service',
      color:     '#1d4ed8',
      textColor: '#ffffff',
      size:      '180 65'
    });
    // Positionner au centre de la vue
    const node = this.diagram.findNodeForKey(newKey);
    if (node) node.location = center;
    this.diagram.commitTransaction('add node');

    // Sélectionner et ouvrir sidebar pour édition immédiate
    if (node) {
      this.diagram.select(node);
      setTimeout(() => {
        const label = node.findObject('LABEL');
        if (label) this.diagram.commandHandler.editTextBlock(label);
      }, 80);
    }
  }

  // ── Recadrer la vue ──────────────────────────────────────
  fitView() {
    if (!this.diagram) return;
    this.diagram.zoomToFit();
  }

  // ── Appliquer un layout arbre ────────────────────────────
  applyLayout() {
    if (!this.diagram) return;
    this.diagram.layoutDiagram(true);
  }

  // ── Vider le canvas ─────────────────────────────────────
  clearAll() {
    if (!confirm('Vider complètement cet organigramme ?')) return;
    this.diagram.startTransaction('clear');
    this.diagram.clear();
    this.diagram.commitTransaction('clear');
    this._save();
    this._showEmpty();
  }

  // ── Initialiser un département vierge ───────────────────
  initialiserNouveauDepartement(idDepartement) {
    if (!DATA.orgCharts) DATA.orgCharts = {};
    DATA.orgCharts[idDepartement] = { nodes: [], edges: [] };
    if (this.deptId === idDepartement) {
      this._setModel([], []);
      this._showEmpty();
    }
    if (typeof saveData === 'function') saveData();
  }

  // ── Modal Templates ──────────────────────────────────────
  openTemplates() {
    const body = document.getElementById('employeFormBody');
    if (!body) return;

    const cards = Object.entries(TEMPLATES_CONFIG).map(([key, tpl]) => `
      <div class="oc-template-card" data-tpl="${key}">
        <div class="oc-tpl-icon">${tpl.label.split(' ')[0]}</div>
        <div class="oc-tpl-name">${tpl.label.slice(tpl.label.indexOf(' ')+1)}</div>
        <div class="oc-tpl-desc">${tpl.nodes.length} nœuds · ${tpl.edges.length} connexions</div>
      </div>`).join('');

    body.innerHTML = `
      <h2>📋 Choisir un modèle de départ</h2>
      <p style="color:#64748b;font-size:.88rem;margin-bottom:16px">
        Le modèle remplace l'organigramme actuel. Vous pourrez ensuite tout modifier.
      </p>
      <div class="oc-template-grid">${cards}</div>
      <div class="modal-actions" style="margin-top:18px">
        <button class="btn secondary" onclick="closeAllModals()">Annuler</button>
      </div>`;

    if (typeof openModal === 'function') openModal('employeFormModal');

    // Lier les cartes sur this directement
    body.querySelectorAll('.oc-template-card[data-tpl]').forEach(card => {
      card.addEventListener('click', () => {
        this.loadTemplate(card.dataset.tpl);
        if (typeof closeAllModals === 'function') closeAllModals();
      });
    });
  }

  // ── Charger un template ──────────────────────────────────
  loadTemplate(type) {
    const tpl = TEMPLATES_CONFIG[type];
    if (!tpl) return;
    if (this.diagram.model.nodeDataArray.length > 0 &&
        !confirm('Remplacer l\'organigramme actuel par ce modèle ?')) return;

    this._setModel(tpl.nodes, tpl.edges);

    // Layout automatique après chargement
    setTimeout(() => {
      this.applyLayout();
      setTimeout(() => this.fitView(), 300);
    }, 80);
  }

  // ── Nettoyage ────────────────────────────────────────────
  destroy() {
    if (this.diagram) {
      this.diagram.div = null;
      this.diagram = null;
    }
  }
}
