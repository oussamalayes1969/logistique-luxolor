// =========================================================
// DONNÉES DE L'APPLICATION — Département Logistique Luxolor
// Modifiez ce fichier (ou utilisez le Mode Édition dans l'app)
// puis re-publiez-le sur GitHub pour mettre à jour le site.
// =========================================================

const APP_DATA = {

  postes: [
    {
      id: "poste_directeur_logistique",
      intitule: "Directeur Logistique",
      service: "Direction Logistique",
      missionPrincipale: "Définir et piloter la stratégie logistique globale de l'entreprise.",
      missionsDetaillees: [
        "Superviser les deux pôles (Dépôt Central et Vente en ligne)",
        "Définir les objectifs et indicateurs de performance",
        "Représenter la logistique auprès de la direction générale"
      ],
      competencesRequises: ["Vision stratégique", "Management", "Supply chain"],
      diplomeRequis: "À compléter",
      experienceRequise: "À compléter"
    },
    {
      id: "poste_resp_depot_central",
      intitule: "Responsable Logistique - Dépôt Central",
      service: "Dépôt Central",
      missionPrincipale: "Piloter l'ensemble des opérations logistiques du dépôt central.",
      missionsDetaillees: [
        "Superviser la gestion des stocks et des approvisionnements",
        "Encadrer l'équipe du dépôt central",
        "Garantir le respect des délais et de la qualité"
      ],
      competencesRequises: ["Gestion d'équipe", "Supply chain", "Excel avancé"],
      diplomeRequis: "Bac+3 minimum en logistique",
      experienceRequise: "5 ans minimum"
    },
    {
      id: "poste_resp_depot_vente_ligne",
      intitule: "Responsable Logistique - Vente en ligne",
      service: "Dépôt Vente en ligne",
      missionPrincipale: "Piloter les opérations logistiques liées à la vente en ligne.",
      missionsDetaillees: [
        "Encadrer l'équipe administrative et les agents de dépôt",
        "Garantir le traitement et l'expédition des commandes en ligne",
        "Suivre les indicateurs de performance e-commerce"
      ],
      competencesRequises: ["Management", "E-commerce", "Outils de gestion de commandes"],
      diplomeRequis: "À compléter",
      experienceRequise: "À compléter"
    },
    {
      id: "poste_gestionnaire_stock",
      intitule: "Gestionnaire de stock",
      service: "Dépôt Central",
      missionPrincipale: "Assurer la gestion et le suivi des stocks du dépôt central.",
      missionsDetaillees: [
        "Suivre les niveaux de stock",
        "Réaliser les inventaires",
        "Gérer les réapprovisionnements"
      ],
      competencesRequises: ["Rigueur", "Excel", "Logiciel de gestion de stock"],
      diplomeRequis: "À compléter",
      experienceRequise: "À compléter"
    },
    {
      id: "poste_agent_depot_central",
      intitule: "Agent de dépôt - Dépôt Central",
      service: "Dépôt Central",
      missionPrincipale: "Participer aux opérations de manutention et de préparation au dépôt central.",
      missionsDetaillees: [
        "Réception et stockage des marchandises",
        "Préparation des commandes",
        "Respect des consignes de sécurité"
      ],
      competencesRequises: ["À compléter"],
      diplomeRequis: "À compléter",
      experienceRequise: "À compléter"
    },
    {
      id: "poste_administratif_vente_ligne",
      intitule: "Employé administratif - Vente en ligne",
      service: "Dépôt Vente en ligne",
      missionPrincipale: "Assurer le suivi administratif des commandes en ligne.",
      missionsDetaillees: [
        "Saisie et suivi des commandes",
        "Relation client (suivi livraison, retours)",
        "Reporting"
      ],
      competencesRequises: ["À compléter"],
      diplomeRequis: "À compléter",
      experienceRequise: "À compléter"
    },
    {
      id: "poste_agent_depot_vente_ligne",
      intitule: "Agent de dépôt - Vente en ligne",
      service: "Dépôt Vente en ligne",
      missionPrincipale: "Préparer et expédier les commandes issues de la vente en ligne.",
      missionsDetaillees: [
        "Préparation des colis",
        "Emballage et étiquetage",
        "Remise aux transporteurs"
      ],
      competencesRequises: ["À compléter"],
      diplomeRequis: "À compléter",
      experienceRequise: "À compléter"
    }
  ],

  employes: [
    { id: "emp_directeur", nom: "À nommer", prenom: "Directeur Logistique", photoUrl: "", posteId: "poste_directeur_logistique", managerId: null, email: "", telephone: "", dateEntree: "" },

    { id: "emp_zied", nom: "Graf", prenom: "Zied", photoUrl: "", posteId: "poste_resp_depot_central", managerId: "emp_directeur", email: "depot@luxolor.com", telephone: "98167949", dateEntree: "2018-01-01" },
    { id: "emp_houcem", nom: "Charfi", prenom: "Houcem", photoUrl: "", posteId: "poste_gestionnaire_stock", managerId: "emp_zied", email: "d.logistique@luxolor.com", telephone: "98137257", dateEntree: "2021-01-01" },

    { id: "emp_central_03", nom: "À compléter", prenom: "Employé 3", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_04", nom: "À compléter", prenom: "Employé 4", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_05", nom: "À compléter", prenom: "Employé 5", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_06", nom: "À compléter", prenom: "Employé 6", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_07", nom: "À compléter", prenom: "Employé 7", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_08", nom: "À compléter", prenom: "Employé 8", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_09", nom: "À compléter", prenom: "Employé 9", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_10", nom: "À compléter", prenom: "Employé 10", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_11", nom: "À compléter", prenom: "Employé 11", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },
    { id: "emp_central_12", nom: "À compléter", prenom: "Employé 12", photoUrl: "", posteId: "poste_agent_depot_central", managerId: "emp_zied", email: "", telephone: "", dateEntree: "" },

    { id: "emp_resp_vente", nom: "À nommer", prenom: "Responsable Vente en ligne", photoUrl: "", posteId: "poste_resp_depot_vente_ligne", managerId: "emp_directeur", email: "", telephone: "", dateEntree: "" },

    { id: "emp_vente_admin_1", nom: "À compléter", prenom: "Administratif 1", photoUrl: "", posteId: "poste_administratif_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_admin_2", nom: "À compléter", prenom: "Administratif 2", photoUrl: "", posteId: "poste_administratif_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_admin_3", nom: "À compléter", prenom: "Administratif 3", photoUrl: "", posteId: "poste_administratif_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_admin_4", nom: "À compléter", prenom: "Administratif 4", photoUrl: "", posteId: "poste_administratif_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },

    { id: "emp_vente_agent_1", nom: "À compléter", prenom: "Agent dépôt 1", photoUrl: "", posteId: "poste_agent_depot_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_agent_2", nom: "À compléter", prenom: "Agent dépôt 2", photoUrl: "", posteId: "poste_agent_depot_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_agent_3", nom: "À compléter", prenom: "Agent dépôt 3", photoUrl: "", posteId: "poste_agent_depot_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_agent_4", nom: "À compléter", prenom: "Agent dépôt 4", photoUrl: "", posteId: "poste_agent_depot_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_agent_5", nom: "À compléter", prenom: "Agent dépôt 5", photoUrl: "", posteId: "poste_agent_depot_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" },
    { id: "emp_vente_agent_6", nom: "À compléter", prenom: "Agent dépôt 6", photoUrl: "", posteId: "poste_agent_depot_vente_ligne", managerId: "emp_resp_vente", email: "", telephone: "", dateEntree: "" }
  ],

  fonctions: [
    {
      id: "fonction_gestion_stock",
      nom: "Fonction Gestion des Stocks",
      objectif: "Assurer la disponibilité et la fiabilité des stocks à tout moment.",
      activitesPrincipales: [
        "Suivi des niveaux de stock",
        "Inventaires tournants",
        "Réapprovisionnement"
      ],
      indicateursPerformance: ["Taux de rupture", "Taux d'écart d'inventaire"],
      postesAssocies: ["poste_resp_depot_central", "poste_gestionnaire_stock", "poste_agent_depot_central"]
    },
    {
      id: "fonction_traitement_commandes",
      nom: "Fonction Traitement des Commandes en ligne",
      objectif: "Garantir un traitement rapide et fiable des commandes e-commerce, de la réception à l'expédition.",
      activitesPrincipales: [
        "Saisie et validation des commandes",
        "Préparation et emballage des colis",
        "Expédition et suivi de livraison"
      ],
      indicateursPerformance: ["Délai moyen de traitement", "Taux d'erreur de préparation", "Taux de retour"],
      postesAssocies: ["poste_resp_depot_vente_ligne", "poste_administratif_vente_ligne", "poste_agent_depot_vente_ligne"]
    }
  ]

};
