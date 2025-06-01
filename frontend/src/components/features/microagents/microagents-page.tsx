import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, CogIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import { Button } from '@heroui/react';
import { toast } from 'react-hot-toast';
import { openreplica } from '#/api/openreplica-axios';
import { MicroagentCard } from './microagent-card';
import { CreateMicroagentModal } from './create-microagent-modal';
import { ImportMicroagentModal } from './import-microagent-modal';
import { MicroagentTestModal } from './microagent-test-modal';

interface Microagent {
  name: string;
  content: string;
  metadata: {
    name: string;
    type: string;
    version: string;
    agent: string;
    triggers: string[];
  };
  source: string;
  type: 'knowledge' | 'repo';
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MicroagentsPageProps {
  className?: string;
}

export function MicroagentsPage({ className = "" }: MicroagentsPageProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'knowledge' | 'repo'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Microagent | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch microagents
  const { data: microagents = [], isLoading, error } = useQuery({
    queryKey: ['microagents', selectedType],
    queryFn: async () => {
      const params = selectedType !== 'all' ? `?microagent_type=${selectedType}` : '';
      const response = await openreplica.get(`/api/microagents${params}`);
      return response.data as Microagent[];
    },
  });

  // Delete microagent mutation
  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      await openreplica.delete(`/api/microagents/${name}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microagents'] });
      toast.success('Microagent deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete microagent');
    },
  });

  // Export microagent mutation
  const exportMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await openreplica.post(`/api/microagents/${name}/export`);
      return response.data;
    },
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([data.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Microagent exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export microagent');
    },
  });

  const handleDelete = (name: string) => {
    if (window.confirm(`Are you sure you want to delete the microagent "${name}"?`)) {
      deleteMutation.mutate(name);
    }
  };

  const handleExport = (name: string) => {
    exportMutation.mutate(name);
  };

  const handleTest = (agent: Microagent) => {
    setSelectedAgent(agent);
    setShowTestModal(true);
  };

  const filteredAgents = microagents.filter(agent => {
    if (selectedType === 'all') return true;
    return agent.type === selectedType;
  });

  const customAgents = filteredAgents.filter(agent => agent.is_custom);
  const builtinAgents = filteredAgents.filter(agent => !agent.is_custom);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-400">
          <p>Failed to load microagents</p>
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
            Microagents
          </h1>
          <p className="text-basic mt-2">
            Specialized AI agents that provide domain expertise and automation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            color="secondary"
            variant="ghost"
            startContent={<UploadIcon className="w-4 h-4" />}
            onPress={() => setShowImportModal(true)}
          >
            Import
          </Button>
          <Button
            color="primary"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary to-secondary text-white"
          >
            Create Agent
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-basic">Filter by type:</span>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'knowledge', label: 'Knowledge' },
            { value: 'repo', label: 'Repository' }
          ].map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={selectedType === value ? "solid" : "ghost"}
              color={selectedType === value ? "primary" : "default"}
              onPress={() => setSelectedType(value as any)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-base-secondary rounded-lg p-4 border border-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <CogIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{customAgents.length}</p>
              <p className="text-sm text-basic">Custom Agents</p>
            </div>
          </div>
        </div>
        
        <div className="bg-base-secondary rounded-lg p-4 border border-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
              <CogIcon className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{builtinAgents.length}</p>
              <p className="text-sm text-basic">Built-in Agents</p>
            </div>
          </div>
        </div>
        
        <div className="bg-base-secondary rounded-lg p-4 border border-tertiary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <CogIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{microagents.length}</p>
              <p className="text-sm text-basic">Total Agents</p>
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

      {/* Custom Agents */}
      {!isLoading && customAgents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-content flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Custom Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customAgents.map((agent) => (
              <MicroagentCard
                key={agent.name}
                agent={agent}
                onDelete={() => handleDelete(agent.name)}
                onExport={() => handleExport(agent.name)}
                onTest={() => handleTest(agent)}
                onEdit={() => {
                  setSelectedAgent(agent);
                  setShowCreateModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Built-in Agents */}
      {!isLoading && builtinAgents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-content flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary rounded-full"></span>
            Built-in Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builtinAgents.map((agent) => (
              <MicroagentCard
                key={agent.name}
                agent={agent}
                onTest={() => handleTest(agent)}
                readonly
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && microagents.length === 0 && (
        <div className="text-center py-12">
          <CogIcon className="w-16 h-16 text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-content mb-2">No microagents found</h3>
          <p className="text-basic mb-6">Create your first microagent to get started</p>
          <Button
            color="primary"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={() => setShowCreateModal(true)}
          >
            Create Agent
          </Button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateMicroagentModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedAgent(null);
          }}
          agent={selectedAgent}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['microagents'] });
            setShowCreateModal(false);
            setSelectedAgent(null);
          }}
        />
      )}

      {showImportModal && (
        <ImportMicroagentModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['microagents'] });
            setShowImportModal(false);
          }}
        />
      )}

      {showTestModal && selectedAgent && (
        <MicroagentTestModal
          isOpen={showTestModal}
          onClose={() => {
            setShowTestModal(false);
            setSelectedAgent(null);
          }}
          agent={selectedAgent}
        />
      )}
    </div>
  );
}
