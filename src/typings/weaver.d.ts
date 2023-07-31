export interface ChatMessage {
  id: string;
  parent: string;
  children: Array<string>;
  message_type: string;
  status: string;
  context: boolean;
  is_loading?: boolean;
  create_time: string;
  update_time: string;
  author: {
    role: string;
    ai_model: string;
    mode: string;
  };
  content: {
    content_type: string;
    parts: string;
  };
}

export interface Conversation {
  currentNode: string;
  context: boolean;
  creationDate: string;
  identifier: string;
  lastModified: string;
  title: string;
  messages: Array<ChatMessage>;
  mode: string;
  model: string;
}

export interface ThreadDescriptor {
  description: string;
}
