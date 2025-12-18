import { Card, CardHeader, CardContent, Badge, Button } from '@/components/ui'
import {
  FolderIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Welcome back! Here&apos;s an overview of your projects.
          </p>
        </div>
        <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
          New Project
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FolderIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text">0</p>
              <p className="text-sm text-text-secondary">Projects</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text">0</p>
              <p className="text-sm text-text-secondary">Meetings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-text">0</p>
              <p className="text-sm text-text-secondary">Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 bg-surface-hover rounded-full mb-4">
              <FolderIcon className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-text font-medium mb-1">No projects yet</h3>
            <p className="text-text-secondary text-sm mb-4">
              Create your first project to get started
            </p>
            <Button variant="secondary" size="sm">
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
