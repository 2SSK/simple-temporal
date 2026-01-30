import {
  proxyActivities,
  defineSignal,
  setHandler,
} from "@temporalio/workflow";

import userActivities from "../../activities/index.js";

const WORKFLOW_CONFIG = {
  startToCloseTimeout: "1 minute",
  executionTimeout: "2 minutes",
};

const proxiedActivities = proxyActivities(
  {
    startToCloseTimeout: WORKFLOW_CONFIG.startToCloseTimeout,
  },
  userActivities,
);

const updateEmail = defineSignal("updateEmail");

async function UserRegistrationWorkflow({
  email,
  password,
  name,
  preferences = {},
}) {
  console.log(`[UserWorkflow] Starting registration for: ${email}`);

  let currentEmail = email;

  setHandler(updateEmail, (newEmail) => {
    console.log(
      `[UserWorkflow] Email update requested: ${currentEmail} -> ${newEmail}`,
    );
    currentEmail = newEmail;
  });

  try {
    console.log(`[UserWorkflow] Step 1: Validating user`);
    const validation = await proxiedActivities.validateUser({
      email: currentEmail,
      password,
      name,
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    console.log(`[UserWorkflow] Step 2: Hashing password`);
    const hashResult = await proxiedActivities.hashPassword({ password });
    const passwordHash = hashResult.passwordHash;

    console.log(`[UserWorkflow] Step 3: Creating user`);
    const user = await proxiedActivities.createUser({
      email: currentEmail,
      name,
      passwordHash,
    });

    console.log(`[UserWorkflow] Step 4: Sending welcome email`);
    const welcomeEmail = await proxiedActivities.sendWelcomeEmail({
      userId: user.userId,
      email: currentEmail,
      name,
    });

    console.log(`[UserWorkflow] Step 5: Generating API key`);
    const apiKey = await proxiedActivities.generateApiKey({
      userId: user.userId,
      email: currentEmail,
    });

    console.log(`[UserWorkflow] Step 6: Setting up preferences`);
    const userPreferences = await proxiedActivities.setupPreferences({
      userId: user.userId,
      preferences,
    });

    const result = {
      userId: user.userId,
      email: currentEmail,
      name,
      status: "registered",
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        status: user.status,
        roles: user.roles,
        createdAt: user.createdAt,
      },
      apiKey: {
        keyId: apiKey.keyId,
        scope: apiKey.scope,
        status: apiKey.status,
        expiresAt: apiKey.expiresAt,
      },
      welcomeEmail: {
        emailId: welcomeEmail.emailId,
        status: welcomeEmail.status,
      },
      preferences: userPreferences.preferences,
      timeline: {
        validatedAt: validation.validatedAt,
        createdAt: user.createdAt,
        emailSentAt: welcomeEmail.sentAt,
        apiKeyCreatedAt: apiKey.createdAt,
        preferencesSetAt: userPreferences.setupAt,
        completedAt: new Date().toISOString(),
      },
    };

    console.log(`[UserWorkflow] Registration completed for: ${currentEmail}`);
    return result;
  } catch (error) {
    console.error(
      `[UserWorkflow] Registration failed for ${email}:`,
      error.message,
    );

    return {
      email,
      status: "failed",
      error: error.message,
      failedAt: new Date().toISOString(),
    };
  }
}

export { UserRegistrationWorkflow };
