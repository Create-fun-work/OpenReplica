import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from '@heroui/react';
import { useMutation } from '@tanstack/react-query';
import { UploadIcon, FileTextIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OpenReplica from '#/api/openreplica';

interface ImportMicroagentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportMicroagentModal({
  isOpen,
  onClose,
  onSuccess
}: ImportMicroagentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    content: ''
  });
  const [isDragOver, setIsDragOver] = useState(false);

  // Import mutation
  const mutation = useMutation({
    mutationFn: async (data: { name: string; content: string }) => {
      return await OpenReplica.importMicroagent(data.name, data.content);
    },
    onSuccess: (response) => {
      toast.success('Microagent imported successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to import microagent');
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      toast.error('Name and content are required');
      return;
    }

    mutation.mutate(formData);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        content,
        name: prev.name || file.name.replace(/\.[^/.]+$/, "")
      }));
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
      handleFileUpload(file);
    } else {
      toast.error('Please upload a markdown (.md) file');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', content: '' });
    setIsDragOver(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
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
            Import Microagent
          </h2>
          <p className="text-sm text-basic">
            Import a microagent from a markdown file with frontmatter
          </p>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${isDragOver 
                  ? 'border-primary bg-primary/10' 
                  : 'border-tertiary-light hover:border-primary/50'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FileTextIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-content mb-2">
                Drop your markdown file here
              </h3>
              <p className="text-basic mb-4">
                or click to browse for a .md file
              </p>
              <Button
                color="primary"
                variant="flat"
                startContent={<UploadIcon className="w-4 h-4" />}
                onPress={() => document.getElementById('file-input')?.click()}
              >
                Choose File
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".md,.markdown"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <p className="text-xs text-basic">
              Expected format: Markdown file with YAML frontmatter containing metadata (name, type, version, triggers, etc.)
            </p>
          </div>

          {/* Name Input */}
          <Input
            label="Agent Name"
            placeholder="Enter a name for this agent"
            value={formData.name}
            onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            isRequired
            description="This will be the unique identifier for your microagent"
            classNames={{
              input: "bg-tertiary",
              inputWrapper: "border-tertiary-light"
            }}
          />

          {/* Content Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-content">Content Preview</h3>
            <Textarea
              placeholder="Paste your microagent content here or upload a file..."
              value={formData.content}
              onValueChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              minRows={12}
              isRequired
              classNames={{
                input: "bg-tertiary font-mono text-sm",
                inputWrapper: "border-tertiary-light"
              }}
            />
            <p className="text-xs text-basic">
              The content should include YAML frontmatter with metadata and markdown content below.
            </p>
          </div>

          {/* Example Format */}
          <details className="text-sm">
            <summary className="cursor-pointer text-primary hover:text-secondary transition-colors">
              Show example format
            </summary>
            <div className="mt-3 p-4 bg-base rounded-lg border border-tertiary">
              <pre className="text-xs text-basic overflow-x-auto">
{`---
name: my-agent
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - python
  - testing
  - debugging
---

# My Custom Agent

This agent provides expertise in Python development and testing.

## Guidelines
- Always write unit tests
- Use type hints
- Follow PEP 8 style guide

## Examples
\`\`\`python
def test_example():
    assert True
\`\`\``}
              </pre>
            </div>
          </details>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={mutation.isPending}
            isDisabled={!formData.name || !formData.content}
            className="bg-gradient-to-r from-primary to-secondary text-white"
          >
            Import Agent
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
