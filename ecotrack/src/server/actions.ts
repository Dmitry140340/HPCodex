// Server actions for authentication, user management, and communications
import { db } from "./db";
import { User } from "../utils/api";

// Store active sessions in memory (in a real app, use Redis or a database)
interface Session {
  userId: string;
  token: string;
  expiresAt: Date;
  role: 'client' | 'manager' | 'logistic' | 'admin';
}

// In-memory store for user sessions
const sessions: Session[] = [
  // Add a default session for development
  {
    userId: "user-1",
    token: "test-token-for-development",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    role: 'client'
  },
  {
    userId: "admin-1",
    token: "admin-token-for-development",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    role: 'admin'
  },
  {
    userId: "logist-1",
    token: "logist-token-for-development",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    role: 'logistic'
  }
];

// Authentication actions
export const getAuth = async (token?: string) => {
  console.log('getAuth called with token:', token);
  console.log('Current sessions count:', sessions.length);
  console.log('Sessions:', sessions.map(s => ({ userId: s.userId, token: s.token, role: s.role })));
  
  // For development, return a default authenticated user if no token is provided
  if (!token && process.env.NODE_ENV === 'development') {
    return {
      userId: "user-1",
      status: "authenticated" as const,
      role: 'client' as const
    };
  }

  // Find session by token
  const session = sessions.find(s => s.token === token);
  console.log('Found session:', session ? { userId: session.userId, role: session.role } : 'none');
  
  // Check if session exists and is not expired
  if (session && new Date() < session.expiresAt) {
    return {
      userId: session.userId,
      status: "authenticated" as const,
      role: session.role
    };
  }
  
  return {
    userId: null,
    status: "unauthenticated" as const,
    role: null
  };
};

// Email sending action
export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  // In a real application, you would integrate with an email service 
  // like SendGrid, Mailgun, AWS SES, etc.
  console.log(`Email sent to ${options.to}: ${options.subject}`);
  if (options.html) {
    console.log("HTML content:", options.html.substring(0, 100) + (options.html.length > 100 ? '...' : ''));
  } else if (options.text) {
    console.log("Text content:", options.text.substring(0, 100) + (options.text.length > 100 ? '...' : ''));
  }
  
  return { success: true, messageId: `msg_${Date.now()}` };
};

// Authentication and user management functions
function prismaUserToUser(user: any): User {
  return {
    ...user,
    role: user.role ?? undefined,
    companyName: user.companyName ?? undefined,
    inn: user.inn ?? undefined,
    kpp: user.kpp ?? undefined,
    billingAddress: user.billingAddress ?? undefined,
    dashboardSettings: user.dashboardSettings ?? undefined,
  };
}

export const signIn = async (email: string, password: string): Promise<{token: string, user: User, role: string}> => {
  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Проверяем пароль с помощью bcrypt
  const bcrypt = require('bcryptjs');
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }
  
  // Generate a token
  const token = `token_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  // Determine role based on user data
  let role: 'client' | 'manager' | 'logistic' | 'admin' = 'client';
  if (user.isAdmin) {
    role = 'admin';
  } else if (email.endsWith('@manager.com')) {
    role = 'manager';
  } else if (email.endsWith('@logistic.com')) {
    role = 'logistic';
  }
  
  // Create session
  const session: Session = {
    userId: user.id,
    token,
    expiresAt,
    role
  };
  
  // Remove any existing sessions for this user
  const existingSessionIndex = sessions.findIndex(s => s.userId === user.id);
  if (existingSessionIndex !== -1) {
    sessions.splice(existingSessionIndex, 1);
  }
  
  // Add new session
  sessions.push(session);
  
  return { token, user: prismaUserToUser(user), role };
};

export const signUp = async (userData: {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}): Promise<{token: string, user: User, role: string}> => {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    });
    if (existingUser) {
      throw new Error("Email already in use");
    }
    // Важно: password обязательно должен быть передан!
    if (!userData.password) {
      throw new Error("Password is required");
    }
    
    // Хешируем пароль перед сохранением
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Determine if user should be admin based on email
    const isAdminUser = userData.email.endsWith('@admin.com') || userData.email === 'admin@himkaplastic.ru';
    
    const newUser = await db.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword, // Используем хешированный пароль
        companyName: userData.companyName || "",
        isAdmin: isAdminUser,
        dashboardSettings: JSON.stringify([
          { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
          { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
          { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
        ])
      }
    });
    // Generate a token and create session
    const token = `token_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    // Determine role based on email domain
    let role: 'client' | 'manager' | 'logistic' | 'admin' = 'client';
    if (userData.email.endsWith('@manager.com')) role = 'manager';
    else if (userData.email.endsWith('@logistic.com')) role = 'logistic';
    else if (userData.email.endsWith('@admin.com') || userData.email === 'admin@himkaplastic.ru') role = 'admin';
    const session: Session = { userId: newUser.id, token, expiresAt, role };
    sessions.push(session);
    return { token, user: prismaUserToUser(newUser), role };
  } catch (err) {
    console.error('Registration error (backend signUp):', err);
    throw err;
  }
};

export const signOut = (token: string): void => {
  const sessionIndex = sessions.findIndex(s => s.token === token);
  if (sessionIndex !== -1) {
    sessions.splice(sessionIndex, 1);
  }
};

// Helper functions for API
export const requireAuth = async (token?: string) => {
  const auth = await getAuth(token);
  if (auth.status !== "authenticated") {
    throw new Error("Authentication required");
  }
  return auth;
};

export const requireAdmin = async (token?: string) => {
  const auth = await getAuth(token);
  if (auth.status !== "authenticated" || auth.role !== 'admin') {
    throw new Error("Admin privileges required");
  }
  return auth;
};

export const getUserById = async (userId: string) => {
  return db.user.findUnique({
    where: { id: userId }
  });
};

export const updateUser = async (userId: string, data: any) => {
  return db.user.update({
    where: { id: userId },
    data
  });
};

// Order-related actions
export const updateOrderPaymentStatus = async (orderId: string, status: string) => {
  return db.order.update({
    where: { id: orderId },
    data: { paymentStatus: status }
  });
};

// Export notifications to simulate real-time updates
export const sendPushNotification = async (userId: string, message: string) => {
  console.log(`[PUSH] Notification to user ${userId}: ${message}`);
  return { success: true };
};

export const sendSMS = async (phoneNumber: string, message: string) => {
  console.log(`[SMS] Message to ${phoneNumber}: ${message}`);
  return { success: true };
};

export { sessions };