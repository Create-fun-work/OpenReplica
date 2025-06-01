import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import OpenReplica from '#/api/openreplica';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSessionModal({
  isOpen,
  onClose,
  onSuccess
}: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    workspace_name: '',
    agent_type: 'codeact',
    llm_provider: 'openai',
    llm_model: 'gpt-4'
  });

  // Fetch available options
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      return await OpenReplica.getAgents();
    },
  });

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      return await OpenReplica.getModels();
    },
  });

  // Create session mutation
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await OpenReplica.createSession(data);
    },
    onSuccess: (response) => {
      toast.success('Session created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create session');
    },
  });

  const handleSubmit = () => {
    if (!formData.workspace_name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    mutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      workspace_name: '',
      agent_type: 'codeact',
      llm_provider: 'openai',
      llm_model: 'gpt-4'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Extract providers from models
  const providers = Array.from(new Set(
    models.map((model: string) => {
      if (model.includes('gpt') || model.includes('openai')) return 'openai';
      if (model.includes('claude') || model.includes('anthropic')) return 'anthropic';
      if (model.includes('gemini') || model.includes('google')) return 'google';
      if (model.includes('llama') || model.includes('meta')) return 'meta';
      return 'other';
    })
  )).filter(provider => provider !== 'other');

  // Filter models based on selected provider
  const filteredModels = models.filter((model: string) => {
    const provider = formData.llm_provider;
    if (provider === 'openai') return model.includes('gpt') || model.includes('openai');
    if (provider === 'anthropic') return model.includes('claude') || model.includes('anthropic');
    if (provider === 'google') return model.includes('gemini') || model.includes('google');
    if (provider === 'meta') return model.includes('llama') || model.includes('meta');
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      classNames={{
        base: "bg-base-secondary border border-tertiary",
        header: "border-b border-tertiary",
        footer: "border-t border-tertiary",
        closeButton: "hover:bg-tertiary"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create New Session
          </h2>
          <p className="text-sm text-basic">
            Set up a new AI agent session with your preferred configuration
          </p>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Workspace Name */}
          <Input
            label="Workspace Name"
            placeholder="Enter a name for your workspace"
            value={formData.workspace_name}
            onValueChange={(value) => setFormData(prev => ({ ...prev, workspace_name: value }))}
            isRequired
            description="A unique name to identify this session"
            classNames={{
              input: "bg-tertiary",
              inputWrapper: "border-tertiary-light"
            }}
          />

          {/* Agent Selection */}
          <Select
            label="Agent Type"
            placeholder="Select an agent"
            selectedKeys={[formData.agent_type]}
            onSelectionChange={(keys) => {
              const agent_type = Array.from(keys)[0] as string;
              setFormData(prev => ({ ...prev, agent_type }));
            }}
            classNames={{
              trigger: "border-tertiary-light bg-tertiary"
            }}
          >
            {agents.map((agent: string) => (
              <SelectItem key={agent} value={agent}>
                {agent}
              </SelectItem>
            ))}
          </Select>

          {/* LLM Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="LLM Provider"
              placeholder="Select provider"
              selectedKeys={[formData.llm_provider]}
              onSelectionChange={(keys) => {
                const llm_provider = Array.from(keys)[0] as string;
                const defaultModels: Record<string, string> = {
                  openai: 'gpt-4',
                  anthropic: 'claude-3-sonnet',
                  google: 'gemini-pro',
                  meta: 'llama-2-70b'
                };
                setFormData(prev => ({ 
                  ...prev, 
                  llm_provider,
                  llm_model: defaultModels[llm_provider] || filteredModels[0] || 'gpt-4'
                }));
              }}
              classNames={{
                trigger: "border-tertiary-light bg-tertiary"
              }}
            >
              {providers.map((provider: string) => (
                <SelectItem key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Model"
              placeholder="Select model"
              selectedKeys={[formData.llm_model]}
              onSelectionChange={(keys) => {
                const llm_model = Array.from(keys)[0] as string;
                setFormData(prev => ({ ...prev, llm_model }));
              }}
              classNames={{
                trigger: "border-tertiary-light bg-tertiary"
              }}
            >
              {filteredModels.map((model: string) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Session Info */}
          <div className="bg-base rounded-lg p-4 border border-tertiary">
            <h3 className="text-sm font-medium text-content mb-3">Session Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-basic">Workspace:</span>
                <span className="text-content">{formData.workspace_name || 'Unnamed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-basic">Agent:</span>
                <span className="text-content">{formData.agent_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-basic">Provider:</span>
                <span className="text-content">{formData.llm_provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-basic">Model:</span>
                <span className="text-content">{formData.llm_model}</span>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={mutation.isPending}
            isDisabled={!formData.workspace_name.trim()}
            className="bg-gradient-to-r from-primary to-secondary text-white"
          >
            Create Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
