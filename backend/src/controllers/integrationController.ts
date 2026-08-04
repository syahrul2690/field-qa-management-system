import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as integrationService from '../services/integrationService';
import * as integrationAuthService from '../services/integrationAuthService';

export const getProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await integrationService.getProjects();
  res.json({ success: true, data: projects });
});

export const getQcReadiness = asyncHandler(async (req: Request, res: Response) => {
  const { boqItemId } = req.params;
  const result = await integrationService.getQcReadiness(boqItemId);

  if (!result) {
    res.status(404).json({ success: false, message: 'BOQ item not found' });
    return;
  }

  res.json({ success: true, data: result });
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const doc = await integrationService.getDocumentWithItpItems(documentId);

  if (!doc) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }

  res.json({ success: true, data: doc });
});

export const verifyAuth = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'email and password are required' });
    return;
  }

  const user = await integrationAuthService.verifyCredentials(email, password);

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials or account not approved' });
    return;
  }

  res.json({ success: true, data: user });
});

export const issueExchangeToken = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    res.status(400).json({ success: false, message: 'user_id is required' });
    return;
  }

  const token = integrationAuthService.issueExchangeToken(user_id);
  res.json({ success: true, data: { token, expires_in: 60 } });
});

export const redeemExchangeToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: 'token is required' });
    return;
  }

  const user = await integrationAuthService.redeemExchangeToken(token);

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid or expired exchange token' });
    return;
  }

  res.json({ success: true, data: user });
});
