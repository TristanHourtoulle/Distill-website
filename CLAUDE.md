# CLAUDE.md — Règles du projet Distill Frontend

## À propos

Frontend de Distill — interface utilisateur pour transformer les résumés de réunions en tâches de développement. Ce repo communique avec le backend Distill-api via REST.

## Stack technique

- **Framework** : Next.js 15+ (App Router)
- **Langage** : TypeScript 5 (strict mode)
- **Styling** : Tailwind CSS
- **État global** : Zustand
- **État serveur** : TanStack Query
- **Formulaires** : React Hook Form + Zod
- **Icônes** : Heroicons (@heroicons/react)
- **Auth** : BetterAuth (client uniquement)

## Règles obligatoires

### Composants UI

- ✅ Créer tous les composants from scratch
- ❌ Ne JAMAIS utiliser shadcn/ui, Radix, Headless UI, ou autre librairie de composants
- ❌ Ne JAMAIS utiliser Lucide Icons — utiliser Heroicons uniquement
- ✅ Chaque composant dans son propre dossier avec structure :
  ```
  Button/
  ├── index.ts
  ├── Button.tsx
  └── Button.types.ts
  ```

### Imports Heroicons

```tsx
// Outline (24x24) — navigation, actions secondaires
import { BeakerIcon } from '@heroicons/react/24/outline'

// Solid (24x24) — états actifs, emphase
import { BeakerIcon } from '@heroicons/react/24/solid'

// Mini (20x20) — boutons, badges, inline
import { BeakerIcon } from '@heroicons/react/20/solid'
```

### Conventions TypeScript

- Strict mode activé, pas de `any`
- Props typées dans fichier `.types.ts` séparé
- Utiliser `interface` pour les props, `type` pour les unions/utilitaires
- Exporter les types depuis `index.ts`

```tsx
// Button.types.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

// index.ts
export { Button } from './Button'
export type { ButtonProps } from './Button.types'
```

### Pattern de composant

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ButtonProps } from './Button.types'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-semibold transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover',
          variant === 'secondary' && 'bg-surface border border-border hover:bg-surface-hover',
          // Sizes
          size === 'sm' && 'h-8 px-3 text-sm rounded-md',
          size === 'md' && 'h-10 px-4 text-sm rounded-md',
          size === 'lg' && 'h-12 px-6 text-base rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

### Appels API

Toujours utiliser le client API centralisé, jamais fetch directement dans les composants.

```tsx
// ✅ Correct
import { api } from '@/lib/api'
const projects = await api.projects.list()

// ❌ Incorrect
const res = await fetch('/api/projects')
```

### TanStack Query

```tsx
// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

### Zustand (état global)

Réservé à l'état UI global uniquement (sidebar ouverte, thème, etc.), pas pour les données serveur.

```tsx
// stores/useUIStore.ts
import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
```

### Formulaires

Toujours React Hook Form + Zod pour la validation.

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, type CreateProjectInput } from '@/schemas/project.schema'

const form = useForm<CreateProjectInput>({
  resolver: zodResolver(createProjectSchema),
  defaultValues: {
    name: '',
    preferredBranch: 'main',
  },
})
```

## Couleurs (thème Deep Focus)

```
background: #0A0A0F
surface: #12121A
surface-hover: #1A1A24
border: #1E1E2E
border-strong: #2E2E3E

primary: #6366F1
primary-hover: #818CF8
accent: #22D3EE

text: #F8FAFC
text-secondary: #CBD5E1
text-muted: #64748B

success: #34D399
warning: #FBBF24
error: #F87171
```

## Structure des dossiers

```
src/
├── app/           # Routes Next.js (App Router)
├── components/
│   ├── ui/        # Composants génériques (Button, Input, Modal...)
│   └── features/  # Composants métier (ProjectCard, TaskCard...)
├── lib/           # Utilitaires, clients API
├── hooks/         # Custom hooks (useProjects, useTasks...)
├── stores/        # Zustand stores
├── types/         # Types globaux
└── schemas/       # Zod schemas
```

## Accessibilité

- Toujours inclure les attributs ARIA nécessaires
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Focus visible (ring) sur tous les éléments interactifs
- Labels sur tous les inputs
- Rôles ARIA sur les éléments custom (dialog, menu, etc.)

## Documentation

- `docs/guideline/MVP Specifications Claude.md` — Plan complet
- `docs/guideline/Système de Design.md` — Design system
