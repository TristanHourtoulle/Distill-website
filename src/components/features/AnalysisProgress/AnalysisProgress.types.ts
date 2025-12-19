import type { ResultEvent } from '@/types'

export interface AnalysisProgressProps {
  taskId: string
  onComplete?: (result: ResultEvent) => void
  onError?: (error: { code: string; message: string }) => void
  className?: string
  autoStart?: boolean
}
