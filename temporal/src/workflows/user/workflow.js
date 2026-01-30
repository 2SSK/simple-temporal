const { proxyActivities, defineSignal, setHandler } = require('@temporalio/workflow');
const crypto = require('crypto');

// Get activities from the auto-loaded module
const activities = require('../../activities').userActivities;

/**
 * Configuration for workflow timeouts
 */
const WORKFLOW_CONFIG = {
  startToCloseTimeout: '1 minute',
  executionTimeout: '2 minutes',
};

/**
 * Proxy activities with configuration
 */
const proxiedActivities = proxyActivities({
  startToCloseTimeout: WORKFLOW_CONFIG.startToCloseTimeout,
}, activities);

// Signals for interactive workflows
const updateEmail = defineSignal('updateEmail');

/**
 * UserRegistrationWorkflow - Complete user registration pipeline
 * @param {Object} input - Workflow input
 * @param {string} input.email - User email
 * @param {string} input.password - User password (plain text)
 * @param {string} input.name - User full name
 * @param {Object} [input.preferences={}] - User preferences
 * @returns {Promise<Object>} Complete registration result
 */
async function UserRegistrationWorkflow({ email, password, name, preferences = {} }) {
  console.log(`[UserWorkflow] Starting registration for: ${email}`);
  
  let currentEmail = email;
  
  // Handle email update signal
  setHandler(updateEmail, (newEmail) => {
    console.log(`[UserWorkflow] Email update requested: ${currentEmail} -> ${newEmail}`);
    currentEmail = newEmail;
  });
  
  try {
    // Step 1: Validate User
    console.log(`[UserWorkflow] Step 1: Validating user`);
    const validation = await proxiedActivities.validateUser({
      email: currentEmail,
      password,
      name
    });
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Step 2: Hash password (secure processing)
    console.log(`[UserWorkflow] Step 2: Hashing password`);
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Step 3: Create User
    console.log(`[UserWorkflow] Step 3: Creating user`);
    const user = await proxiedActivities.createUser({
      email: currentEmail,
      name,
      passwordHash
    });
    
    // Step 4: Send Welcome Email
    console.log(`[UserWorkflow] Step 4: Sending welcome email`);
    const welcomeEmail = await proxiedActivities.sendWelcomeEmail({
      userId: user.userId,
      email: currentEmail,
      name
    });
    
    // Step 5: Generate API Key
    console.log(`[UserWorkflow] Step 5: Generating API key`);
    const apiKey = await proxiedActivities.generateApiKey({
      userId: user.userId,
      email: currentEmail
    });
    
    // Step 6: Setup Preferences
    console.log(`[UserWorkflow] Step 6: Setting up preferences`);
    const userPreferences = await proxiedActivities.setupPreferences({
      userId: user.userId,
      preferences
    });
    
    const result = {
      userId: user.userId,
      email: currentEmail,
      name,
      status: 'registered',
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        status: user.status,
        roles: user.roles,
        createdAt: user.createdAt
      },
      apiKey: {
        keyId: apiKey.keyId,
        scope: apiKey.scope,
        status: apiKey.status,
        expiresAt: apiKey.expiresAt
        // Note: fullApiKey should be stored securely by client
      },
      welcomeEmail: {
        emailId: welcomeEmail.emailId,
        status: welcomeEmail.status
      },
      preferences: userPreferences.preferences,
      timeline: {
        validatedAt: validation.validatedAt,
        createdAt: user.createdAt,
        emailSentAt: welcomeEmail.sentAt,
        apiKeyCreatedAt: apiKey.createdAt,
        preferencesSetAt: userPreferences.setupAt,
        completedAt: new Date().toISOString()
      }
    };
    
    console.log(`[UserWorkflow] Registration completed for: ${currentEmail}`);
    return result;
    
  } catch (error) {
    console.error(`[UserWorkflow] Registration failed for ${email}:`, error.message);
    
    return {
      email,
      status: 'failed',
      error: error.message,
      failedAt: new Date().toISOString()
    };
  }
}

module.exports = { UserRegistrationWorkflow };
