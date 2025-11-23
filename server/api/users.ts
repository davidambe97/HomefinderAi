/**
 * User authentication and management API
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomBytes, createHash } from 'crypto';

// Note: These packages need to be installed:
// npm install bcrypt jsonwebtoken
// npm install --save-dev @types/bcrypt @types/jsonwebtoken
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * TypeScript types for user management
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Hashed password
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthRequest extends Request {
  user?: PublicUser;
}

/**
 * JWT secret - In production, use environment variable
 */
const JWT_SECRET = process.env.JWT_SECRET || 'homefinder-ai-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Database file path
 */
const DB_DIR = join(process.cwd(), 'server', 'db');
const USERS_FILE = join(DB_DIR, 'users.json');

/**
 * Initialize database directory and file if they don't exist
 */
async function ensureDbExists(): Promise<void> {
  try {
    if (!existsSync(DB_DIR)) {
      await mkdir(DB_DIR, { recursive: true });
      console.log('[Users] Created database directory:', DB_DIR);
    }
    
    if (!existsSync(USERS_FILE)) {
      await writeFile(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      console.log('[Users] Created users database file:', USERS_FILE);
    }
  } catch (error) {
    console.error('[Users] Error ensuring database exists:', error);
    throw new Error('Failed to initialize database');
  }
}

/**
 * Read users from JSON file
 */
async function readUsers(): Promise<User[]> {
  try {
    await ensureDbExists();
    const data = await readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('[Users] Error reading users:', error);
    return [];
  }
}

/**
 * Write users to JSON file
 */
async function writeUsers(users: User[]): Promise<void> {
  try {
    await ensureDbExists();
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Users] Error writing users:', error);
    throw new Error('Failed to save user data');
  }
}

/**
 * Generate unique user ID
 */
function generateUserId(): string {
  return `user_${randomBytes(16).toString('hex')}`;
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token for user
 */
function generateToken(user: PublicUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

/**
 * Verify JWT token and return decoded payload
 */
function verifyToken(token: string): PublicUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      iat?: number;
      exp?: number;
    };
    
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      createdAt: '', // Not in token, will be fetched from DB if needed
      updatedAt: '', // Not in token, will be fetched from DB if needed
    };
  } catch (error) {
    console.error('[Users] Token verification failed:', error);
    return null;
  }
}

/**
 * Convert User to PublicUser (remove password)
 */
function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Register a new user
 * @param data - Registration data (name, email, password)
 * @returns AuthResponse with token and user data
 */
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  try {
    console.log('[Users] Registration attempt for email:', data.email);
    
    // Validate input
    if (!data.name || !data.email || !data.password) {
      throw new Error('Name, email, and password are required');
    }
    
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Read existing users
    const users = await readUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      console.log('[Users] Registration failed: Email already exists:', data.email);
      throw new Error('Email already registered');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(data.password);
    
    // Create new user
    const now = new Date().toISOString();
    const newUser: User = {
      id: generateUserId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };
    
    // Save user
    users.push(newUser);
    await writeUsers(users);
    
    console.log('[Users] User registered successfully:', newUser.id, newUser.email);
    
    // Generate token
    const publicUser = toPublicUser(newUser);
    const token = generateToken(publicUser);
    
    return {
      token,
      user: publicUser,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    console.error('[Users] Registration error:', errorMessage);
    throw error;
  }
}

/**
 * Login user
 * @param data - Login data (email, password)
 * @returns AuthResponse with token and user data
 */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  try {
    console.log('[Users] Login attempt for email:', data.email);
    
    // Validate input
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }
    
    // Read users
    const users = await readUsers();
    
    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user) {
      console.log('[Users] Login failed: User not found:', data.email);
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      console.log('[Users] Login failed: Invalid password for:', data.email);
      throw new Error('Invalid email or password');
    }
    
    // Update last login time
    user.updatedAt = new Date().toISOString();
    await writeUsers(users);
    
    console.log('[Users] User logged in successfully:', user.id, user.email);
    
    // Generate token
    const publicUser = toPublicUser(user);
    const token = generateToken(publicUser);
    
    return {
      token,
      user: publicUser,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    console.error('[Users] Login error:', errorMessage);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<PublicUser | null> {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === userId);
    return user ? toPublicUser(user) : null;
  } catch (error) {
    console.error('[Users] Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<PublicUser | null> {
  try {
    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? toPublicUser(user) : null;
  } catch (error) {
    console.error('[Users] Error getting user by email:', error);
    return null;
  }
}

/**
 * Auth middleware for Express/Next.js API routes
 * Extracts JWT from Authorization header and verifies it
 * 
 * Usage in API route:
 * ```typescript
 * export async function GET(req: Request) {
 *   const user = await authMiddleware(req);
 *   if (!user) {
 *     return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
 *   }
 *   // Use user object here
 * }
 * ```
 */
export async function authMiddleware(req: Request): Promise<PublicUser | null> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.log('[Users] Auth middleware: No Authorization header');
      return null;
    }
    
    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      console.log('[Users] Auth middleware: Invalid Authorization header format');
      return null;
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!token) {
      console.log('[Users] Auth middleware: No token provided');
      return null;
    }
    
    // Verify token
    const user = verifyToken(token);
    
    if (!user) {
      console.log('[Users] Auth middleware: Token verification failed');
      return null;
    }
    
    // Optionally verify user still exists in database
    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      console.log('[Users] Auth middleware: User not found in database');
      return null;
    }
    
    console.log('[Users] Auth middleware: User authenticated:', user.id, user.email);
    return dbUser;
  } catch (error) {
    console.error('[Users] Auth middleware error:', error);
    return null;
  }
}

/**
 * Helper function to create 401 Unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Helper function to create error response
 */
export function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Helper function to create success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

