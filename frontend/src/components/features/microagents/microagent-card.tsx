import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Tooltip } from '@heroui/react';
import { 
  BrainIcon, 
  FolderIcon, 
  EditIcon, 
  TrashIcon, 
  DownloadIcon, 
  PlayIcon,
  CalendarIcon,
  TagIcon
} from 'lucide-react';

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

interface MicroagentCardProps {
  agent: Microagent;
  onDelete?: () => void;
  onExport?: () => void;
  onTest?: () => void;
  onEdit?: () => void;
  readonly?: boolean;
}

export function MicroagentCard({ 
  agent, 
  onDelete, 
  onExport, 
  onTest, 
  onEdit, 
  readonly = false 
}: MicroagentCardProps) {
  const getTypeIcon = () => {
    return agent.type === 'knowledge' ? (
      <BrainIcon className="w-5 h-5" />
    ) : (
      <FolderIcon className="w-5 h-5" />
    );
  };

  const getTypeColor = () => {
    return agent.type === 'knowledge' ? 'primary' : 'secondary';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const contentPreview = agent.content.length > 150 
    ? agent.content.substring(0, 150) + '...' 
    : agent.content;

  return (
    <Card className="bg-base-secondary border border-tertiary hover:border-primary/50 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              agent.type === 'knowledge' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/20 text-secondary'
            }`}>
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-content group-hover:text-primary transition-colors">
                {agent.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Chip
                  size="sm"
                  color={getTypeColor()}
                  variant="flat"
                  className="text-xs"
                >
                  {agent.type}
                </Chip>
                <span className="text-xs text-basic">v{agent.metadata.version}</span>
                {agent.is_custom && (
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="text-xs"
                  >
                    Custom
                  </Chip>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-sm text-basic line-clamp-3">
            {contentPreview}
          </p>
        </div>

        {/* Triggers (for knowledge agents) */}
        {agent.type === 'knowledge' && agent.metadata.triggers.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="w-3 h-3 text-basic" />
              <span className="text-xs text-basic">Triggers</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.metadata.triggers.slice(0, 3).map((trigger, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  className="text-xs"
                >
                  {trigger}
                </Chip>
              ))}
              {agent.metadata.triggers.length > 3 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="text-xs"
                >
                  +{agent.metadata.triggers.length - 3}
                </Chip>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-basic">Agent:</span>
            <span className="text-content">{agent.metadata.agent}</span>
          </div>
          {agent.created_at && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-basic">Created:</span>
              <span className="text-content">{formatDate(agent.created_at)}</span>
            </div>
          )}
          {agent.updated_at && agent.updated_at !== agent.created_at && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-basic">Updated:</span>
              <span className="text-content">{formatDate(agent.updated_at)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-tertiary">
          {onTest && (
            <Tooltip content="Test agent">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                isIconOnly
                onPress={onTest}
              >
                <PlayIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
          
          {!readonly && (
            <>
              {onEdit && (
                <Tooltip content="Edit agent">
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    isIconOnly
                    onPress={onEdit}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
              
              {onExport && (
                <Tooltip content="Export agent">
                  <Button
                    size="sm"
                    variant="flat"
                    color="default"
                    isIconOnly
                    onPress={onExport}
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip content="Delete agent">
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    isIconOnly
                    onPress={onDelete}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
