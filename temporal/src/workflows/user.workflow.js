import { defineSignal, setHandler, condition } from "@temporalio/workflow";
import {
  validateUserRegistration,
  hashPassword,
  createUser,
  generateApiKey,
  sendWelcomeEmail,
} from "../activities/user.activity.js";

/**
 * Signal to suspend the user
 */
export const suspendUserSignal = defineSignal("suspendUser");

/**
 * User Registration Workflow
 * Handles complete user registration process
 */
export async function UserRegistrationWorkflow({
  email,
  password,
  name,
  preferences,
}) {
  let user = null;
  let apiKey = null;
  let suspensionReason = null;

  // Handle suspension signal (for future use)
  setHandler(suspendUserSignal, (reason) => {
    suspensionReason = reason;
  });

  try {
    // Step 1: Validate user registration data
    validateUserRegistration({ email, password, name });

    // Step 2: Hash password
    const passwordHash = await hashPassword(password);

    // Step 3: Create user in database
    user = await createUser({
      email,
      name,
      preferences,
      hashedPassword: passwordHash.hashedPassword,
    });

    // Step 4: Generate API key
    apiKey = await generateApiKey(user.id);

    // Step 5: Send welcome email
    await sendWelcomeEmail(user, apiKey);

    // Return successful registration result
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      status: "active",
      apiKey: apiKey.key,
      apiKeyId: apiKey.key.substring(0, 20) + "...", // Partial for security
      registeredAt: new Date().toISOString(),
      preferences: user.preferences,
    };
  } catch (error) {
    return {
      userId: user?.id || null,
      email: email,
      status: "registration_failed",
      error: error.message,
      failedAt: new Date().toISOString(),
      suspensionReason: suspensionReason,
    };
  }
}

/**
 * User Suspension Workflow
 * Handles user suspension process
 */
export async function UserSuspensionWorkflow({ userId, reason }) {
  try {
    // Import here to avoid circular dependency
    const { suspendUser } = await import("../activities/user.activity.js");

    // Suspend the user
    const result = await suspendUserActivity(userId, reason);

    return {
      userId,
      suspended: true,
      reason,
      suspendedAt: new Date().toISOString(),
      suspendedBy: "system",
    };
  } catch (error) {
    return {
      userId,
      suspended: false,
      error: error.message,
      failedAt: new Date().toISOString(),
    };
  }
}

