import { createContextLogger } from "../../../utils/logger.js";

const logger = createContextLogger("userActivity");

/**
 * Validate user registration data
 * @param {Object} userData - User registration data
 * @returns {boolean} - Whether data is valid
 */
export async function validateUserRegistration(userData) {
  logger.info("Validating user registration", { email: userData.email });
  
  if (!userData.email || !userData.password || !userData.name) {
    throw new Error("Email, password, and name are required");
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error("Invalid email format");
  }
  
  // Password validation
  if (userData.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  
  // Simulate checking for existing email
  await new Promise(resolve => setTimeout(resolve, 100));
  const emailExists = Math.random() < 0.1; // 10% chance email exists
  
  if (emailExists) {
    throw new Error("Email already registered");
  }
  
  logger.info("User validation successful");
  return true;
}

/**
 * Hash user password securely
 * @param {string} password - Plain text password
 * @returns {Object} - Hash result
 */
export async function hashPassword(password) {
  logger.info("Hashing password");
  
  // Simulate password hashing (in real app, use bcrypt)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const hashedPassword = `hashed_${btoa(password)}`;
  
  logger.info("Password hashed successfully");
  return { 
    hashedPassword,
    algorithm: "bcrypt",
    rounds: 10,
  };
}

/**
 * Create user in database
 * @param {Object} userData - User information
 * @returns {Object} - Created user
 */
export async function createUser(userData) {
  logger.info("Creating user", { email: userData.email });
  
  // Simulate database creation
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const user = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    email: userData.email,
    name: userData.name,
    hashedPassword: userData.hashedPassword,
    preferences: userData.preferences || {},
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  logger.info("User created successfully", { userId: user.id });
  return user;
}

/**
 * Generate API key for user
 * @param {string} userId - User ID
 * @returns {Object} - Generated API key
 */
export async function generateApiKey(userId) {
  logger.info("Generating API key", { userId });
  
  // Simulate API key generation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const apiKey = {
    key: `key_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    userId,
    name: "Default API Key",
    permissions: ["read", "write"],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    lastUsed: null,
  };
  
  logger.info("API key generated successfully", { userId });
  return apiKey;
}

/**
 * Send welcome email to user
 * @param {Object} userData - User information
 * @param {Object} apiKey - Generated API key
 * @returns {Object} - Email result
 */
export async function sendWelcomeEmail(userData, apiKey) {
  logger.info("Sending welcome email", { email: userData.email });
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const emailResult = {
    to: userData.email,
    subject: "Welcome to our platform!",
    sent: true,
    timestamp: new Date().toISOString(),
    template: "welcome",
    variables: {
      userName: userData.name,
      apiKey: apiKey.key,
      loginUrl: "https://api.example.com/login",
    },
  };
  
  logger.info("Welcome email sent successfully", { email: userData.email });
  return emailResult;
}

/**
 * Get user from database
 * @param {string} userId - User ID
 * @returns {Object} - User data
 */
export async function getUserById(userId) {
  logger.info("Fetching user", { userId });
  
  // Simulate database lookup
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate user not found
  if (Math.random() < 0.05) { // 5% chance user not found
    throw new Error("User not found");
  }
  
  const user = {
    id: userId,
    email: "user@example.com", // Mock data
    name: "Test User",
    status: "active",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  
  logger.info("User fetched successfully", { userId });
  return user;
}

/**
 * Suspend user in database
 * @param {string} userId - User ID
 * @param {string} reason - Suspension reason
 * @returns {Object} - Suspension result
 */
export async function suspendUser(userId, reason) {
  logger.info("Suspending user", { userId, reason });
  
  // Simulate suspension
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const suspensionResult = {
    userId,
    suspended: true,
    reason,
    suspendedAt: new Date().toISOString(),
    suspendedBy: "system",
  };
  
  logger.info("User suspended successfully", { userId, reason });
  return suspensionResult;
}