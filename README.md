# 🧪 Distill — Frontend

> **From meetings to code, distilled.**

Interface utilisateur de Distill, l'outil qui transforme automatiquement les résumés de réunions en tâches de développement actionnables et contextualisées.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![BetterAuth](https://img.shields.io/badge/BetterAuth-1-6366F1?style=flat-square)

---

## 🏗️ Architecture

Ce repo contient uniquement le **frontend** de Distill. Le backend est dans un repo séparé.

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Distill-web    │◄───────►│  Distill-api    │
│  (ce repo)      │  REST   │  (autre repo)   │
│                 │         │                 │
│  Next.js        │         │  Node.js        │
│  React          │         │  Prisma         │
│  Tailwind       │         │  PostgreSQL     │
│                 │         │  Claude API     │
└─────────────────┘         └─────────────────┘
```

---

## ✨ Fonctionnalités

- **🔐 Authentification** — GitHub OAuth via BetterAuth
- **📊 Dashboard** — Vue d'ensemble des projets et tâches
- **🔗 Gestion de projets** — Connexion repos GitHub, configuration des règles
- **📝 Import de réunions** — Upload ou copier/coller des résumés
- **🎯 Visualisation des tâches** — Liste, filtres, badges de complexité
- **🤖 Résultats d'analyse** — Affichage des plans d'implémentation
- **📤 Export** — Interface d'export vers GitHub Issues

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [MVP Specifications](./docs/guideline/MVP%20Specifications%20Claude.md) | Plan de développement complet |
| [Système de Design](./docs/guideline/Système%20de%20Design.md) | Identité visuelle, palette "Deep Focus" |
| [Schéma BDD](./docs/guideline/Schéma%20de%20base%20de%20données.mermaid) | Architecture de données |
| [User Journey](./docs/guideline/User%20Journey%20Mermaid%20-%20Automatisation%20GitHub.mermaid) | Parcours utilisateur |

---

## 🛠️ Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 15+ (App Router) |
| Langage | TypeScript 5 |
| Styling | Tailwind CSS |
| État global | Zustand |
| État serveur | TanStack Query |
| Formulaires | React Hook Form + Zod |
| Icônes | Heroicons |
| Auth (client) | BetterAuth |
| HTTP Client | Fetch / TanStack Query |

### Principes

- ✅ Composants UI custom (pas de shadcn/ui, Radix, etc.)
- ✅ Clean code, scalable et maintenable
- ✅ TypeScript strict
- ✅ Accessibilité (ARIA, keyboard navigation)

---

## 🚀 Installation

### Prérequis

- Node.js 20+
- pnpm (recommandé)
- Backend Distill-api lancé (voir repo backend)

### 1. Cloner le repo

```bash
git clone https://github.com/[username]/Distill-website.git
cd Distill-website
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration environnement

```bash
cp .env.example .env.local
```

```env
# API Backend
NEXT_PUBLIC_API_URL="http://localhost:4000"

# BetterAuth
NEXT_PUBLIC_AUTH_URL="http://localhost:4000/api/auth"
```

### 4. Lancer le serveur de développement

```bash
pnpm dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

> ⚠️ Le backend doit être lancé sur le port 4000 pour que l'authentification et les API fonctionnent.

---

## 📁 Structure du projet

```
src/
├── app/                       # App Router Next.js
│   ├── (auth)/               # Routes publiques (login)
│   │   └── login/
│   ├── (dashboard)/          # Routes protégées
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard principal
│   │   └── projects/
│   │       ├── [id]/
│   │       │   ├── page.tsx
│   │       │   └── meetings/
│   │       └── new/
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # Composants génériques
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Dropdown/
│   │   ├── Toast/
│   │   ├── Skeleton/
│   │   └── Spinner/
│   └── features/             # Composants métier
│       ├── ProjectCard/
│       ├── TaskCard/
│       ├── MeetingForm/
│       ├── BranchSelector/
│       ├── AnalysisResult/
│       └── RuleEditor/
├── lib/
│   ├── api.ts                # Client API (fetch wrapper)
│   ├── auth-client.ts        # BetterAuth client
│   └── utils.ts              # Utilitaires (cn, formatters)
├── hooks/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useMeetings.ts
│   └── useTasks.ts
├── stores/                   # Zustand stores
│   ├── useAuthStore.ts
│   └── useUIStore.ts
├── types/                    # Types TypeScript
│   ├── project.ts
│   ├── meeting.ts
│   ├── task.ts
│   └── api.ts
└── schemas/                  # Zod schemas (validation forms)
    ├── project.schema.ts
    ├── meeting.schema.ts
    └── rule.schema.ts
```

---

## 🎨 Design System

Le projet utilise le thème **"Deep Focus"** — un design sombre, moderne et premium.

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0A0A0F` | Fond principal |
| `surface` | `#12121A` | Cards, modales |
| `primary` | `#6366F1` | Actions principales |
| `accent` | `#22D3EE` | Highlights |

→ Voir [Système de Design](./docs/guideline/Système%20de%20Design.md) pour la documentation complète.

---

## 📜 Scripts disponibles

```bash
# Développement
pnpm dev              # Lancer le serveur dev (port 3000)
pnpm build            # Build de production
pnpm start            # Lancer en production
pnpm lint             # Linter ESLint
pnpm type-check       # Vérification TypeScript

# Tests
pnpm test             # Tests unitaires
pnpm test:e2e         # Tests E2E (Playwright)
```

---

## 🔗 Repos liés

| Repo | Description |
|------|-------------|
| [Distill-api](https://github.com/[username]/Distill-api) | Backend Node.js, API REST, Agent LLM |

---

## 📄 Licence

Propriétaire — Tous droits réservés.

---

<p align="center">
  <strong>Distill</strong> — Meetings → Tasks → Code
</p>
