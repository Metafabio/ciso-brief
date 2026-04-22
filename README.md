# Resilience Revenue Brief (by Mauden)

Intelligence dashboard per System Integrator, MSP e team storage/backup per vendere servizi di cyber resilience.

## Obiettivo

Trasformare segnali di mercato, news vendor e trend ransomware in azioni tecniche e opportunità commerciali. Focus specifico su Mauden / System Integrator storage & backup.

## Funzionalità Core

- **Executive Brief**: Recap settimanale M&A, Product Release e Threat intelligence.
- **Action Register**: Tabella operativa che collega segnali di mercato a servizi Mauden.
- **Vendor Matrix**: Confronto tecnico-commerciale tra Veeam, Rubrik, Cohesity, Commvault.
- **Sales Playbook**: Pitch e objection handling per team sales e pre-sales.
- **Risk Score**: Analisi del rischio per settore e vendor.

## Getting Started

Esegui il server di sviluppo locale:

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) per visualizzare la dashboard.

## Struttura Dati

La dashboard è data-driven e utilizza file JSON statici in `public/`:

- `brief.json`: Dati executive settimanali.
- `market_analysis.json`: Analisi brand e segnali.
- `action_register.json`: Registro azioni operative.
- `business_packages.json`: Offerte e servizi Mauden.
- `sales_playbook.json`: Strategie di vendita.
- `vendor_matrix.json`: Matrice comparativa vendor.
- `backupl.json`: Intelligence specifica sul backup.
- `risk_score.json`: Score di rischio settoriali.

## Workflow

Il progetto include uno script di generazione (`generate-brief.mjs`) che può essere usato per aggiornare i file JSON tramite LLM.

```bash
npm run brief:validate   # Valida l'integrità dei file JSON
npm run build            # Verifica la build Next.js
```

## Requisiti

- Node.js 20+
- Nessun database richiesto (static JSON-first architecture)
- Nessuna autenticazione (progettato per uso locale/VPN)

---
*Progetto basato su Next.js 16 e React 19.*
