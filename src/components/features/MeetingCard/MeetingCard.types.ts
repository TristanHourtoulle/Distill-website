import type { Meeting } from '@/types'

export interface MeetingCardProps {
  meeting: Meeting
  onClick?: () => void
  onDelete?: () => void
  onParse?: () => void
  className?: string
}
