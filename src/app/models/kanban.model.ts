export interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  verified: boolean;
  online: boolean;
  lastSeen?: string;
}

export interface KanbanCard {
  _id: string;
  title: string;
  description?: string;
  column: 'todo' | 'inprogress' | 'onhold' | 'completed';
  boardId: string;
  assignees: Assignee[];
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoard {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  cards: KanbanCard[];
  createdAt: string;
  updatedAt: string;
}
