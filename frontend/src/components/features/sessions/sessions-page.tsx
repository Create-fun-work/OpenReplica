import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  MessageSquareIcon, 
  TrashIcon, 
  ClockIcon,
  BrainIcon,
  ServerIcon,
  PlayIcon
} from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Chip, Tooltip } from '@heroui/react';
import { toast } from 'react-hot-toast';
import { openreplica } from '#/api/openreplica-axios';
import { CreateSessionModal } from './create-session-modal';
import { SessionDetailsModal } from './session-details-modal';

interface Session {
  session_id: string;
  workspace_name: string;
  agent_type: string;
  llm_provider: string;
  llm_model: string;
  status: string;
  created_at: string;
  last_activity: string;
  message_count: number;
}

interface SessionsPageProps {
  className?: string;
}

export function SessionsPage({ className = "" }: SessionsPageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch sessions
  const { data: sessionsData, isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await openreplica.get('/api/sessions/');
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const sessions = sessionsData?.sessions || [];

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await openreplica.delete(`/api/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete session');
    },
  });

  const handleDelete = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      deleteMutation.mutate(sessionId);
    }
  };

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'deleted': return 'danger';
      default: return 'default';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'primary';
      case 'anthropic': return 'secondary';
      case 'google': return 'warning';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-400">
          <p>Failed to load sessions</p>
          <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Sessions
          </h1>
          <p className="text-basic mt-2">
            Manage your AI agent sessions and workspaces
          </p>
        </div>
        
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-primary to-secondary text-white"
        >
          New Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-base-secondary rounded-lg p-4 border border-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <PlayIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {sessions.filter((s: Session) => s.status === 'active').length}
              </p>
              <p className="text-sm text-basic">Active Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-base-secondary rounded-lg p-4 border border-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
              <MessageSquareIcon className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">
                {sessions.reduce((total: number, s: Session) => total + s.message_count, 0)}
              </p>
              <p className="text-sm text-basic">Total Messages</p>
            </div>
          </div>
        </div>
        
        <div className="bg-base-secondary rounded-lg p-4 border border-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <BrainIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {new Set(sessions.map((s: Session) => s.agent_type)).size}
              </p>
              <p className="text-sm text-basic">Agent Types</p>
            </div>
          </div>
        </div>
        
        <div className="bg-base-secondary rounded-lg p-4 border border-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
              <ServerIcon className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {new Set(sessions.map((s: Session) => s.llm_provider)).size}
              </p>
              <p className="text-sm text-basic">Providers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Sessions Grid */}
      {!isLoading && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session: Session) => (
            <Card 
              key={session.session_id}
              className="bg-base-secondary border border-tertiary hover:border-primary/50 transition-all duration-200 group cursor-pointer"
              isPressable
              onPress={() => handleViewDetails(session)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <BrainIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-content group-hover:text-primary transition-colors">
                        {session.workspace_name}
                      </h3>
                      <p className="text-sm text-basic">
                        {session.session_id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tooltip content="Delete session">
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        isIconOnly
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(session.session_id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                {/* Status and Activity */}
                <div className="flex items-center justify-between mb-4">
                  <Chip
                    size="sm"
                    color={getStatusColor(session.status)}
                    variant="flat"
                  >
                    {session.status}
                  </Chip>
                  <div className="flex items-center gap-1 text-xs text-basic">
                    <ClockIcon className="w-3 h-3" />
                    {getRelativeTime(session.last_activity)}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-basic">Agent:</span>
                    <Chip size="sm" variant="flat" color="secondary">
                      {session.agent_type}
                    </Chip>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-basic">Provider:</span>
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color={getProviderColor(session.llm_provider)}
                    >
                      {session.llm_provider}
                    </Chip>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-basic">Model:</span>
                    <span className="text-content text-xs">{session.llm_model}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-basic">Messages:</span>
                    <span className="text-primary font-medium">{session.message_count}</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="mt-4 pt-3 border-t border-tertiary text-xs text-basic">
                  <div className="flex justify-between">
                    <span>Created: {formatDate(session.created_at)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sessions.length === 0 && (
        <div className="text-center py-12">
          <BrainIcon className="w-16 h-16 text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-content mb-2">No active sessions</h3>
          <p className="text-basic mb-6">Create your first AI session to get started</p>
          <Button
            color="primary"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={() => setShowCreateModal(true)}
          >
            Create Session
          </Button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateSessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            setShowCreateModal(false);
          }}
        />
      )}

      {showDetailsModal && selectedSession && (
        <SessionDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSession(null);
          }}
          session={selectedSession}
        />
      )}
    </div>
  );
}
