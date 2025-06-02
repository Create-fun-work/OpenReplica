import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Card,
  CardBody,
  Chip,
} from '@heroui/react';
import { useMutation } from '@tanstack/react-query';
import { PlayIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
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

interface TestResult {
  triggered: boolean;
  matched_trigger?: string;
  all_triggers?: string[];
  message?: string;
}

interface MicroagentTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Microagent;
}

export function MicroagentTestModal({
  isOpen,
  onClose,
  agent
}: MicroagentTestModalProps) {
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Test mutation
  const testMutation = useMutation({
    mutationFn: async (message: string) => {
      return await OpenReplica.testMicroagent(agent.name, message) as TestResult;
    },
    onSuccess: (result) => {
      setTestResult(result);
      if (result.triggered) {
        toast.success('Agent would be triggered!');
      } else {
        toast.error('Agent would not be triggered');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to test microagent');
    },
  });

  const handleTest = () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }
    testMutation.mutate(testMessage);
  };

  const handleClose = () => {
    setTestMessage('');
    setTestResult(null);
    onClose();
  };

  const getExampleMessages = () => {
    if (agent.type === 'repo') {
      return [
        "How do I set up the development environment?",
        "What are the coding standards for this project?",
        "How do I run the tests?"
      ];
    } else {
      // Knowledge agent - create examples based on triggers
      return agent.metadata.triggers.slice(0, 3).map(trigger => 
        `I need help with ${trigger}`
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
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
            Test Microagent: {agent.name}
          </h2>
          <p className="text-sm text-basic">
            {agent.type === 'knowledge' 
              ? 'Test if your message would trigger this knowledge agent'
              : 'Repository agents are always active - test how they respond'
            }
          </p>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Agent Info */}
          <Card className="bg-base border border-tertiary">
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-content">Agent Details</h3>
                <Chip
                  size="sm"
                  color={agent.type === 'knowledge' ? 'primary' : 'secondary'}
                  variant="flat"
                >
                  {agent.type}
                </Chip>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-basic">Version:</span>
                  <span className="text-content ml-2">{agent.metadata.version}</span>
                </div>
                <div>
                  <span className="text-basic">Base Agent:</span>
                  <span className="text-content ml-2">{agent.metadata.agent}</span>
                </div>
              </div>

              {agent.type === 'knowledge' && agent.metadata.triggers.length > 0 && (
                <div>
                  <p className="text-sm text-basic mb-2">Trigger Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.metadata.triggers.map((trigger, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        className="text-xs"
                      >
                        {trigger}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Test Input */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-content">Test Message</h3>
            <Textarea
              placeholder="Enter a message to test against this agent..."
              value={testMessage}
              onValueChange={setTestMessage}
              minRows={4}
              classNames={{
                input: "bg-tertiary",
                inputWrapper: "border-tertiary-light"
              }}
            />
            
            <div className="flex gap-2">
              <Button
                color="primary"
                startContent={<PlayIcon className="w-4 h-4" />}
                onPress={handleTest}
                isLoading={testMutation.isPending}
                className="bg-gradient-to-r from-primary to-secondary text-white"
              >
                Test Agent
              </Button>
            </div>
          </div>

          {/* Example Messages */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-content">Example Messages</h3>
            <div className="space-y-2">
              {getExampleMessages().map((example, index) => (
                <button
                  key={index}
                  onClick={() => setTestMessage(example)}
                  className="w-full text-left p-3 bg-tertiary rounded-lg border border-tertiary-light hover:border-primary/50 transition-colors text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <Card className={`border ${
              testResult.triggered 
                ? 'border-success bg-success/10' 
                : 'border-danger bg-danger/10'
            }`}>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  {testResult.triggered ? (
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-danger" />
                  )}
                  <h3 className="font-medium text-content">
                    {testResult.triggered ? 'Agent Triggered!' : 'Agent Not Triggered'}
                  </h3>
                </div>

                {testResult.triggered && testResult.matched_trigger && (
                  <div className="text-sm">
                    <span className="text-basic">Matched trigger:</span>
                    <Chip
                      size="sm"
                      color="success"
                      variant="flat"
                      className="ml-2"
                    >
                      {testResult.matched_trigger}
                    </Chip>
                  </div>
                )}

                {testResult.message && (
                  <p className="text-sm text-basic">
                    {testResult.message}
                  </p>
                )}

                {!testResult.triggered && agent.type === 'knowledge' && (
                  <div className="text-sm space-y-2">
                    <p className="text-basic">
                      Your message didn't match any triggers. Try including one of these keywords:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {agent.metadata.triggers.map((trigger, index) => (
                        <Chip
                          key={index}
                          size="sm"
                          color="primary"
                          variant="flat"
                          className="cursor-pointer"
                          onClick={() => setTestMessage(`I need help with ${trigger}`)}
                        >
                          {trigger}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
