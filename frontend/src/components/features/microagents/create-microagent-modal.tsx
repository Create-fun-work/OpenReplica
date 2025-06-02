import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
} from '@heroui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OpenReplica from '#/api/openreplica';

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
  type: 'knowledge' | 'repo';
  is_custom: boolean;
}

interface CreateMicroagentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent?: Microagent | null;
}

export function CreateMicroagentModal({
  isOpen,
  onClose,
  onSuccess,
  agent
}: CreateMicroagentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'knowledge' as 'knowledge' | 'repo',
    version: '1.0.0',
    agent_type: 'CodeActAgent',
    triggers: [] as string[],
    content: ''
  });
  const [newTrigger, setNewTrigger] = useState('');

  const isEditing = !!agent;

  // Load templates
  const { data: templates } = useQuery({
    queryKey: ['microagent-templates'],
    queryFn: async () => {
      return await OpenReplica.getMicroagentTemplates();
    },
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const microagentData = {
        name: data.name,
        type: data.type,
        content: data.content,
        metadata: {
          name: data.name,
          type: data.type,
          version: data.version,
          agent: data.agent_type,
          triggers: data.triggers
        }
      };

      if (isEditing) {
        return await OpenReplica.updateMicroagent(agent.name, microagentData);
      } else {
        return await OpenReplica.createMicroagent(microagentData);
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Microagent updated successfully' : 'Microagent created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save microagent');
    },
  });

  // Reset form when modal opens/closes or agent changes
  useEffect(() => {
    if (isOpen) {
      if (agent) {
        setFormData({
          name: agent.name,
          type: agent.type,
          version: agent.metadata.version,
          agent_type: agent.metadata.agent,
          triggers: agent.metadata.triggers,
          content: agent.content
        });
      } else {
        setFormData({
          name: '',
          type: 'knowledge',
          version: '1.0.0',
          agent_type: 'CodeActAgent',
          triggers: [],
          content: ''
        });
      }
    }
  }, [isOpen, agent]);

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      toast.error('Name and content are required');
      return;
    }

    mutation.mutate(formData);
  };

  const addTrigger = () => {
    if (newTrigger && !formData.triggers.includes(newTrigger)) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, newTrigger]
      }));
      setNewTrigger('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const loadTemplate = (templateType: 'knowledge' | 'repo') => {
    if (templates?.[templateType]) {
      const template = templates[templateType];
      setFormData({
        name: template.name,
        type: templateType,
        version: template.metadata.version,
        agent_type: template.metadata.agent,
        triggers: template.metadata.triggers || [],
        content: template.content
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
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
            {isEditing ? 'Edit Microagent' : 'Create New Microagent'}
          </h2>
          <p className="text-sm text-basic">
            {isEditing ? 'Update your custom microagent' : 'Create a specialized AI agent for domain expertise'}
          </p>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Templates */}
          {!isEditing && templates && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-content">Quick Start Templates</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() => loadTemplate('knowledge')}
                >
                  Knowledge Agent Template
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="secondary"
                  onPress={() => loadTemplate('repo')}
                >
                  Repository Agent Template
                </Button>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              placeholder="my-custom-agent"
              value={formData.name}
              onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              isRequired
              classNames={{
                input: "bg-tertiary",
                inputWrapper: "border-tertiary-light"
              }}
            />
            
            <Select
              label="Type"
              placeholder="Select agent type"
              selectedKeys={[formData.type]}
              onSelectionChange={(keys) => {
                const type = Array.from(keys)[0] as 'knowledge' | 'repo';
                setFormData(prev => ({ ...prev, type }));
              }}
              classNames={{
                trigger: "border-tertiary-light bg-tertiary"
              }}
            >
              <SelectItem key="knowledge" value="knowledge">
                Knowledge Agent (Triggered by keywords)
              </SelectItem>
              <SelectItem key="repo" value="repo">
                Repository Agent (Always active)
              </SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Version"
              placeholder="1.0.0"
              value={formData.version}
              onValueChange={(value) => setFormData(prev => ({ ...prev, version: value }))}
              classNames={{
                input: "bg-tertiary",
                inputWrapper: "border-tertiary-light"
              }}
            />
            
            <Select
              label="Base Agent"
              placeholder="Select base agent"
              selectedKeys={[formData.agent_type]}
              onSelectionChange={(keys) => {
                const agent_type = Array.from(keys)[0] as string;
                setFormData(prev => ({ ...prev, agent_type }));
              }}
              classNames={{
                trigger: "border-tertiary-light bg-tertiary"
              }}
            >
              <SelectItem key="CodeActAgent" value="CodeActAgent">
                CodeActAgent
              </SelectItem>
              <SelectItem key="BrowsingAgent" value="BrowsingAgent">
                BrowsingAgent
              </SelectItem>
            </Select>
          </div>

          {/* Triggers (only for knowledge agents) */}
          {formData.type === 'knowledge' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-content">Triggers</h3>
              <p className="text-xs text-basic">
                Keywords that will activate this agent in conversations
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add trigger keyword"
                  value={newTrigger}
                  onValueChange={setNewTrigger}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrigger();
                    }
                  }}
                  classNames={{
                    input: "bg-tertiary",
                    inputWrapper: "border-tertiary-light"
                  }}
                />
                <Button
                  color="primary"
                  isIconOnly
                  onPress={addTrigger}
                  isDisabled={!newTrigger}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.triggers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.triggers.map((trigger, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      color="primary"
                      variant="flat"
                      endContent={
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => removeTrigger(trigger)}
                          className="w-4 h-4 min-w-0"
                        >
                          <XIcon className="w-3 h-3" />
                        </Button>
                      }
                    >
                      {trigger}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-content">Content</h3>
            <Textarea
              placeholder="Enter the microagent's instructions and knowledge..."
              value={formData.content}
              onValueChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              minRows={10}
              isRequired
              classNames={{
                input: "bg-tertiary",
                inputWrapper: "border-tertiary-light"
              }}
            />
            <p className="text-xs text-basic">
              Use Markdown format. Include instructions, guidelines, examples, and any domain-specific knowledge.
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={mutation.isPending}
            className="bg-gradient-to-r from-primary to-secondary text-white"
          >
            {isEditing ? 'Update Agent' : 'Create Agent'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
