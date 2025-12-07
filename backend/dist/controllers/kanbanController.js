"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssigneeRole = exports.deleteCard = exports.updateCard = exports.createCard = exports.getBoardById = exports.getBoards = exports.createBoard = void 0;
const KanbanCard_1 = require("../models/KanbanCard");
const KanbanBoard_1 = require("../models/KanbanBoard");
const Session_1 = require("../models/Session");
const User_1 = require("../models/User");
const ActivityLog_1 = require("../models/ActivityLog");
const socket_1 = require("../utils/socket");
const createBoard = async (req, res) => {
    try {
        const { title, description } = req.body;
        const board = new KanbanBoard_1.KanbanBoard({
            title,
            description,
            owner: req.userId,
        });
        await board.save();
        res.status(201).json(board);
    }
    catch (error) {
        console.error('Create board error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createBoard = createBoard;
const getBoards = async (req, res) => {
    try {
        const boards = await KanbanBoard_1.KanbanBoard.find({ owner: req.userId });
        const boardsWithCards = await Promise.all(boards.map(async (board) => {
            const cards = await KanbanCard_1.KanbanCard.find({ boardId: board._id })
                .populate('assignees', '-password')
                .lean();
            // Get session data for assignees
            const assigneeIds = cards.flatMap((c) => c.assignees.map((a) => a._id));
            const activeSessions = await Session_1.Session.find({
                user: { $in: assigneeIds },
                endedAt: null,
            }).distinct('user');
            const onlineUserIds = new Set(activeSessions.map((id) => id.toString()));
            const cardsWithStatus = cards.map((card) => ({
                ...card,
                assignees: card.assignees.map((assignee) => ({
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
        }));
        res.json(boardsWithCards);
    }
    catch (error) {
        console.error('Get boards error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getBoards = getBoards;
const getBoardById = async (req, res) => {
    try {
        const { id } = req.params;
        const board = await KanbanBoard_1.KanbanBoard.findById(id);
        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }
        const cards = await KanbanCard_1.KanbanCard.find({ boardId: id })
            .populate('assignees', '-password')
            .lean();
        // Get online status
        const assigneeIds = cards.flatMap((c) => c.assignees.map((a) => a._id));
        const activeSessions = await Session_1.Session.find({
            user: { $in: assigneeIds },
            endedAt: null,
        }).distinct('user');
        const onlineUserIds = new Set(activeSessions.map((id) => id.toString()));
        const cardsWithStatus = cards.map((card) => ({
            ...card,
            assignees: card.assignees.map((assignee) => ({
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
    }
    catch (error) {
        console.error('Get board error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getBoardById = getBoardById;
const createCard = async (req, res) => {
    try {
        const { title, description, boardId, priority, assignees, dueDate } = req.body;
        const card = new KanbanCard_1.KanbanCard({
            title,
            description,
            boardId,
            priority,
            assignees: assignees || [],
            dueDate,
        });
        await card.save();
        await card.populate('assignees', '-password');
        socket_1.socketManager.emitKanbanUpdate(boardId, {
            type: 'cardCreated',
            card,
        });
        res.status(201).json(card);
    }
    catch (error) {
        console.error('Create card error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createCard = createCard;
const updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, column, priority, assignees, dueDate } = req.body;
        const card = await KanbanCard_1.KanbanCard.findByIdAndUpdate(id, {
            $set: {
                ...(title && { title }),
                ...(description && { description }),
                ...(column && { column }),
                ...(priority && { priority }),
                ...(assignees && { assignees }),
                ...(dueDate && { dueDate }),
            },
        }, { new: true }).populate('assignees', '-password');
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        socket_1.socketManager.emitKanbanUpdate(card.boardId.toString(), {
            type: 'cardUpdated',
            card,
        });
        res.json(card);
    }
    catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateCard = updateCard;
const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await KanbanCard_1.KanbanCard.findByIdAndDelete(id);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }
        socket_1.socketManager.emitKanbanUpdate(card.boardId.toString(), {
            type: 'cardDeleted',
            cardId: id,
        });
        res.json({ message: 'Card deleted' });
    }
    catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteCard = deleteCard;
const updateAssigneeRole = async (req, res) => {
    try {
        const { cardId, assigneeId } = req.params;
        const { newRole } = req.body;
        const user = await User_1.User.findByIdAndUpdate(assigneeId, { role: newRole }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const card = await KanbanCard_1.KanbanCard.findById(cardId);
        socket_1.socketManager.emitUserUpdated(assigneeId, { role: newRole });
        socket_1.socketManager.emitKanbanUpdate(card?.boardId.toString() || '', {
            type: 'assigneeRoleUpdated',
            assigneeId,
            newRole,
        });
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'UPDATE_ASSIGNEE_ROLE',
            target: cardId,
            meta: { assigneeId, newRole },
        });
        res.json({ message: 'Role updated', user });
    }
    catch (error) {
        console.error('Update assignee role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateAssigneeRole = updateAssigneeRole;
//# sourceMappingURL=kanbanController.js.map