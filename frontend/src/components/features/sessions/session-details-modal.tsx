import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Textarea,
  Tabs,
  Tab,
} from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquareIcon, 
  ActivityIcon, 
  SendIcon,
  UserIcon,
  BotIcon,
  ClockIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { openreplica } from '#/api/openreplica-axios';

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

interface Message {
  message_id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  event_type?: string;
}

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

export function SessionDetailsModal({
  isOpen,
  onClose,
  session
}: SessionDetailsModalProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('messages');
  
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['session-messages', session.session_id],
    queryFn: async () => {
      const response = await openreplica.get(`/api/sessions/${session.session_id}/messages`);
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['session-events', session.session_id],
    queryFn: async () => {
      const response = await openreplica.get(`/api/sessions/${session.session_id}/events`);
      return response.data;
    },
    enabled: isOpen,
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await openreplica.post(`/api/sessions/${session.session_id}/messages`, {
        content,
        role: 'user'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-messages', session.session_id] });
      setNewMessage('');
      toast.success('Message sent');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    },
  });

  const messages = messagesData?.messages || [];
  const events = eventsData?.events || [];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addMessageMutation.mutate(newMessage);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'deleted': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-base-secondary border border-tertiary",
        header: "border-b border-tertiary",
        footer: "border-t border-tertiary",
        closeButton: "hover:bg-tertiary"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {session.workspace_name}
              </h2>
              <p className="text-sm text-basic">
                Session ID: {session.session_id}
              </p>
            </div>
            <Chip
              size="sm"
              color={getStatusColor(session.status)}
              variant="flat"
            >
              {session.status}
            </Chip>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-base rounded-lg p-3 border border-tertiary">
              <p className="text-basic">Agent</p>
              <p className="text-content font-medium">{session.agent_type}</p>
            </div>
            <div className="bg-base rounded-lg p-3 border border-tertiary">
              <p className="text-basic">Provider</p>
              <p className="text-content font-medium">{session.llm_provider}</p>
            </div>
            <div className="bg-base rounded-lg p-3 border border-tertiary">
              <p className="text-basic">Model</p>
              <p className="text-content font-medium">{session.llm_model}</p>
            </div>
            <div className="bg-base rounded-lg p-3 border border-tertiary">
              <p className="text-basic">Messages</p>
              <p className="text-primary font-bold">{session.message_count}</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-0">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            classNames={{
              base: "w-full",
              tabList: "grid w-full grid-cols-2 bg-base-secondary",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-6 h-12",
              tabContent: "group-data-[selected=true]:text-white"
            }}
          >
            <Tab
              key="messages"
              title={
                <div className="flex items-center gap-2">
                  <MessageSquareIcon className="w-4 h-4" />
                  Messages
                </div>
              }
            >
              <div className="p-6 space-y-4">
                {/* Messages List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-basic">
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    messages.map((message: Message) => (
                      <div
                        key={message.message_id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' ? 'bg-primary/20' : 'bg-secondary/20'
                          }`}>
                            {message.role === 'user' ? (
                              <UserIcon className="w-4 h-4 text-primary" />
                            ) : (
                              <BotIcon className="w-4 h-4 text-secondary" />
                            )}
                          </div>
                          <div className={`space-y-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-base border border-tertiary text-content'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-basic">
                              <ClockIcon className="w-3 h-3" />
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Message */}
                <div className="flex gap-2 pt-4 border-t border-tertiary">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onValueChange={setNewMessage}
                    minRows={2}
                    maxRows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
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
                    onPress={handleSendMessage}
                    isLoading={addMessageMutation.isPending}
                    isDisabled={!newMessage.trim()}
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Tab>

            <Tab
              key="events"
              title={
                <div className="flex items-center gap-2">
                  <ActivityIcon className="w-4 h-4" />
                  Events
                </div>
              }
            >
              <div className="p-6 space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {eventsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8 text-basic">
                      No events recorded yet.
                    </div>
                  ) : (
                    events.map((event: any, index: number) => (
                      <Card key={index} className="bg-base border border-tertiary">
                        <CardBody className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Chip size="sm" variant="flat" color="secondary">
                              {event.event_type || 'Event'}
                            </Chip>
                            <span className="text-xs text-basic">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                          <pre className="text-xs text-content bg-tertiary rounded p-2 overflow-x-auto">
                            {JSON.stringify(event, null, 2)}
                          </pre>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-basic">
              Created: {formatDate(session.created_at)} • 
              Last activity: {formatDate(session.last_activity)}
            </div>
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
