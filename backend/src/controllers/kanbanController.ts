import { Request, Response } from 'express';
import { KanbanCard } from '../models/KanbanCard';
import { KanbanBoard } from '../models/KanbanBoard';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { socketManager } from '../utils/socket';

export const createBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    const board = new KanbanBoard({
      title,
      description,
      owner: req.userId,
    });

    await board.save();

    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBoards = async (req: Request, res: Response): Promise<void> => {
  try {
    const boards = await KanbanBoard.find({ owner: req.userId });

    const boardsWithCards = await Promise.all(
      boards.map(async (board: any) => {
        const cards = await KanbanCard.find({ boardId: board._id })
          .populate('assignees', '-password')
          .lean();

        // Get session data for assignees
        const assigneeIds = cards.flatMap((c) => c.assignees.map((a: any) => a._id));
        const activeSessions = await Session.find({
          user: { $in: assigneeIds },
          endedAt: null,
        }).distinct('user');
        const onlineUserIds = new Set(activeSessions.map((id) => id.toString()));

        const cardsWithStatus = cards.map((card: any) => ({
          ...card,
          assignees: card.assignees.map((assignee: any) => ({
            id: assignee._id,
            name: assignee.name,
            avatarUrl: assignee.profile?.avatarUrl,
            role: assignee.role,
            verified: assignee.verified,
            online: onlineUserIds.has(assignee._id.toString()),
            lastSeen: assignee.lastLoginAt,
          })),
        }));

        return {
          ...board.toObject(),
          cards: cardsWithStatus,
        };
      })
    );

    res.json(boardsWithCards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBoardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const board = await KanbanBoard.findById(id);
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    const cards = await KanbanCard.find({ boardId: id })
      .populate('assignees', '-password')
      .lean();

    // Get online status
    const assigneeIds = cards.flatMap((c) => c.assignees.map((a: any) => a._id));
    const activeSessions = await Session.find({
      user: { $in: assigneeIds },
      endedAt: null,
    }).distinct('user');
    const onlineUserIds = new Set(activeSessions.map((id) => id.toString()));

    const cardsWithStatus = cards.map((card: any) => ({
      ...card,
      assignees: card.assignees.map((assignee: any) => ({
        id: assignee._id,
        name: assignee.name,
        avatarUrl: assignee.profile?.avatarUrl,
        role: assignee.role,
        verified: assignee.verified,
        online: onlineUserIds.has(assignee._id.toString()),
        lastSeen: assignee.lastLoginAt,
      })),
    }));

    res.json({
      ...board.toObject(),
      cards: cardsWithStatus,
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, boardId, priority, assignees, dueDate } = req.body;

    const card = new KanbanCard({
      title,
      description,
      boardId,
      priority,
      assignees: assignees || [],
      dueDate,
    });

    await card.save();
    await card.populate('assignees', '-password');

    socketManager.emitKanbanUpdate(boardId, {
      type: 'cardCreated',
      card,
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, column, priority, assignees, dueDate } = req.body;

    const card = await KanbanCard.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(title && { title }),
          ...(description && { description }),
          ...(column && { column }),
          ...(priority && { priority }),
          ...(assignees && { assignees }),
          ...(dueDate && { dueDate }),
        },
      },
      { new: true }
    ).populate('assignees', '-password');

    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    socketManager.emitKanbanUpdate(card.boardId.toString(), {
      type: 'cardUpdated',
      card,
    });

    res.json(card);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const card = await KanbanCard.findByIdAndDelete(id);
    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    socketManager.emitKanbanUpdate(card.boardId.toString(), {
      type: 'cardDeleted',
      cardId: id,
    });

    res.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAssigneeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cardId, assigneeId } = req.params;
    const { newRole } = req.body;

    const user = await User.findByIdAndUpdate(
      assigneeId,
      { role: newRole },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const card = await KanbanCard.findById(cardId);

    socketManager.emitUserUpdated(assigneeId, { role: newRole });
    socketManager.emitKanbanUpdate(card?.boardId.toString() || '', {
      type: 'assigneeRoleUpdated',
      assigneeId,
      newRole,
    });

    await ActivityLog.create({
      actor: req.userId,
      action: 'UPDATE_ASSIGNEE_ROLE',
      target: cardId,
      meta: { assigneeId, newRole },
    });

    res.json({ message: 'Role updated', user });
  } catch (error) {
    console.error('Update assignee role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
