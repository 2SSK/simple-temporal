import crypto from "crypto";

const userActivities = {
  async hashPassword({ password }) {
    console.log("[UserActivity] Hashing password");

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    return {
      passwordHash,
      algorithm: "sha256",
    };
  },

  async validateUser({ email, password, name }) {
    console.log(`[UserActivity] Validating user: ${email}`);

    const errors = [];

    if (!email || !email.includes("@")) {
      errors.push("Invalid email address");
    }

    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!name || name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    const emailExists = Math.random() > 0.9;
    if (emailExists) {
      errors.push("Email already registered");
    }

    console.log(
      `[UserActivity] Validation ${errors.length === 0 ? "passed" : "failed"} for ${email}`,
    );

    return {
      isValid: errors.length === 0,
      errors,
      email,
      validatedAt: new Date().toISOString(),
    };
  },

  async createUser({ email, name, passwordHash }) {
    console.log(`[UserActivity] Creating user: ${email}`);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[UserActivity] User created: ${userId}`);

    return {
      userId,
      email,
      name,
      status: "active",
      createdAt: new Date().toISOString(),
      roles: ["user"],
    };
  },

  async sendWelcomeEmail({ userId, email, name }) {
    console.log(`[UserActivity] Sending welcome email to ${email}`);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const emailId = `email_${Date.now()}`;

    console.log(`[UserActivity] Welcome email sent: ${emailId}`);

    return {
      emailId,
      userId,
      to: email,
      subject: "Welcome to Our Platform!",
      status: "sent",
      sentAt: new Date().toISOString(),
    };
  },

  async generateApiKey({ userId, email, scope = "read" }) {
    console.log(`[UserActivity] Generating API key for user ${userId}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const apiKey = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const apiSecret = `sk_${Math.random().toString(36).substr(2, 32)}`;

    console.log(`[UserActivity] API key generated for user ${userId}`);

    return {
      keyId: `key_${Date.now()}`,
      userId,
      apiKey: apiKey.substring(0, 12) + "...",
      fullApiKey: apiKey,
      apiSecret: apiSecret.substring(0, 8) + "...",
      scope,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async setupPreferences({ userId, preferences = {} }) {
    console.log(`[UserActivity] Setting up preferences for user ${userId}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const defaultPreferences = {
      notifications: {
        email: true,
        push: false,
        sms: false,
      },
      language: "en",
      timezone: "UTC",
      theme: "light",
      ...preferences,
    };

    console.log(`[UserActivity] Preferences set for user ${userId}`);

    return {
      userId,
      preferences: defaultPreferences,
      setupAt: new Date().toISOString(),
    };
  },
};

export default userActivities;
