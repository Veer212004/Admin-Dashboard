import { Request, Response } from 'express';
import { analyticsService } from '../services/AnalyticsService';

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await analyticsService.getSummary();
    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSignupTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to as string) : new Date();

    const trend = await analyticsService.getSignupTrend(fromDate, toDate);

    res.json({ trend });
  } catch (error) {
    console.error('Get signup trend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSessionsTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to as string) : new Date();

    const trend = await analyticsService.getSessionsTrend(fromDate, toDate);

    res.json({ trend });
  } catch (error) {
    console.error('Get sessions trend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActiveUsersByDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to as string) : new Date();

    const data = await analyticsService.getActiveUsersByDay(fromDate, toDate);

    res.json({ data });
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
