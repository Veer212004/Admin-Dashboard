"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveUsersByDay = exports.getSessionsTrend = exports.getSignupTrend = exports.getSummary = void 0;
const AnalyticsService_1 = require("../services/AnalyticsService");
const getSummary = async (req, res) => {
    try {
        const summary = await AnalyticsService_1.analyticsService.getSummary();
        res.json(summary);
    }
    catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSummary = getSummary;
const getSignupTrend = async (req, res) => {
    try {
        const { from, to } = req.query;
        const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();
        const trend = await AnalyticsService_1.analyticsService.getSignupTrend(fromDate, toDate);
        res.json({ trend });
    }
    catch (error) {
        console.error('Get signup trend error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSignupTrend = getSignupTrend;
const getSessionsTrend = async (req, res) => {
    try {
        const { from, to } = req.query;
        const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();
        const trend = await AnalyticsService_1.analyticsService.getSessionsTrend(fromDate, toDate);
        res.json({ trend });
    }
    catch (error) {
        console.error('Get sessions trend error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSessionsTrend = getSessionsTrend;
const getActiveUsersByDay = async (req, res) => {
    try {
        const { from, to } = req.query;
        const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();
        const data = await AnalyticsService_1.analyticsService.getActiveUsersByDay(fromDate, toDate);
        res.json({ data });
    }
    catch (error) {
        console.error('Get active users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getActiveUsersByDay = getActiveUsersByDay;
//# sourceMappingURL=analyticsController.js.map