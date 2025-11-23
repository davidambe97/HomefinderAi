/**
 * Express server for HomeFinder AI SaaS backend
 * Serves all API routes for deployment
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import API route handlers
import { registerUser, loginUser } from './api/users.js';
import { 
  listClients, 
  addClient, 
  updateClient, 
  deleteClient,
  getClientById,
  getAuthenticatedAgent 
} from './api/clients.js';
import { getDashboardForAuthenticatedAgent } from './api/dashboard.js';
import { searchProperties } from './api/searchProperties.js';
import {
  generateAlertsResponse,
  dashboardResultsToListingsMap,
  extractClientNames,
  listingHistory,
} from './utils/alerts.js';
import { authMiddleware, createUnauthorizedResponse, createErrorResponse, createSuccessResponse } from './api/users.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ==================== Auth Routes ====================

app.post('/api/users/register', async (req, res) => {
  try {
    const response = await registerUser(req.body);
    res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    console.error('[API] Register error:', message);
    res.status(400).json({ error: message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const response = await loginUser(req.body);
    res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    console.error('[API] Login error:', message);
    res.status(400).json({ error: message });
  }
});

// ==================== Client Routes ====================

app.get('/api/clients', async (req, res) => {
  try {
    const agent = await authMiddleware(req as any);
    if (!agent) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const clients = await listClients(agent.id);
    res.status(200).json({ clients });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clients';
    console.error('[API] Get clients error:', message);
    res.status(500).json({ error: message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const agent = await authMiddleware(req as any);
    if (!agent) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const client = await addClient(req.body, agent.id);
    res.status(201).json(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add client';
    console.error('[API] Add client error:', message);
    res.status(400).json({ error: message });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const agent = await authMiddleware(req as any);
    if (!agent) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const client = await getClientById(req.params.id, agent.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.status(200).json(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client';
    console.error('[API] Get client error:', message);
    res.status(500).json({ error: message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const agent = await authMiddleware(req as any);
    if (!agent) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const client = await updateClient(req.params.id, req.body, agent.id);
    res.status(200).json(client);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update client';
    console.error('[API] Update client error:', message);
    res.status(400).json({ error: message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const agent = await authMiddleware(req as any);
    if (!agent) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await deleteClient(req.params.id, agent.id);
    res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete client';
    console.error('[API] Delete client error:', message);
    res.status(400).json({ error: message });
  }
});

// ==================== Dashboard Route ====================

app.get('/api/dashboard', async (req, res) => {
  try {
    const dashboard = await getDashboardForAuthenticatedAgent(req as any);
    
    if (!dashboard) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(200).json(dashboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard';
    console.error('[API] Dashboard error:', message);
    res.status(500).json({ error: message });
  }
});

// ==================== Search Route ====================

app.post('/api/search', async (req, res) => {
  try {
    const query = req.body;
    console.log('[API] Search request:', query);
    
    const result = await searchProperties(query);
    
    res.status(200).json({
      success: true,
      listings: result.listings,
      totalFound: result.totalFound,
      sources: result.results.map(r => ({
        source: r.source,
        success: r.success,
        count: r.listings.length,
        error: r.error,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('[API] Search error:', message);
    res.status(500).json({
      success: false,
      error: message,
      listings: [],
      totalFound: 0,
    });
  }
});

// ==================== Alerts Route ====================

app.get('/api/alerts', async (req, res) => {
  try {
    const dashboard = await getDashboardForAuthenticatedAgent(req as any);
    
    if (!dashboard) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get current listings
    const currentListings = dashboardResultsToListingsMap(dashboard.results);
    const clientNames = extractClientNames(dashboard.results);
    
    // Get previous listings from history
    const previousListings = listingHistory.getAll();
    
    // Generate alerts
    const alertsResponse = generateAlertsResponse(
      previousListings,
      currentListings,
      clientNames
    );
    
    // Update history with current listings
    for (const result of dashboard.results) {
      listingHistory.set(result.clientId, result.listings);
    }
    
    res.status(200).json(alertsResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch alerts';
    console.error('[API] Alerts error:', message);
    res.status(500).json({ error: message });
  }
});

// ==================== Error Handling ====================

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 HomeFinder AI SaaS Backend Server');
  console.log('='.repeat(60));
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log('='.repeat(60));
  console.log('✅ Server started successfully');
  console.log('📋 Available endpoints:');
  console.log('   POST /api/users/register');
  console.log('   POST /api/users/login');
  console.log('   GET  /api/clients');
  console.log('   POST /api/clients');
  console.log('   GET  /api/clients/:id');
  console.log('   PUT  /api/clients/:id');
  console.log('   DELETE /api/clients/:id');
  console.log('   GET  /api/dashboard');
  console.log('   POST /api/search');
  console.log('   GET  /api/alerts');
  console.log('='.repeat(60));
});

export default app;

