export interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string
  onSuccess?: () => void
}
