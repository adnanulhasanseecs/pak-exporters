/**
 * Security Event Logging
 * Logs security-related events for monitoring and auditing
 */

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGIN_BLOCKED"
  | "REGISTER_SUCCESS"
  | "REGISTER_FAILURE"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "PASSWORD_RESET_FAILURE"
  | "TOKEN_REFRESH"
  | "TOKEN_INVALID"
  | "AUTHORIZATION_FAILURE"
  | "RATE_LIMIT_EXCEEDED"
  | "SUSPICIOUS_ACTIVITY";

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  details?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Log a security event
 */
export function logSecurityEvent(
  type: SecurityEventType,
  ip: string,
  options: {
    userId?: string;
    email?: string;
    userAgent?: string;
    details?: Record<string, any>;
  } = {}
): void {
  const event: SecurityEvent = {
    type,
    timestamp: new Date().toISOString(),
    ip,
    userAgent: options.userAgent,
    userId: options.userId,
    email: options.email,
    details: options.details,
    severity: getEventSeverity(type),
  };

  // In production, this would send to a security information and event management (SIEM) system
  // or a dedicated logging service. For now, we'll log to console and could extend to file/database.
  
  if (process.env.NODE_ENV === "production") {
    // In production, log to a secure logging service
    console.log("[SECURITY EVENT]", JSON.stringify(event));
  } else {
    // In development, log with more detail
    console.log(`[SECURITY EVENT - ${event.severity.toUpperCase()}]`, {
      type: event.type,
      timestamp: event.timestamp,
      ip: event.ip,
      userId: event.userId,
      email: event.email,
      details: event.details,
    });
  }

  // TODO: In production, send to:
  // - Security monitoring service (Sentry, LogRocket, etc.)
  // - SIEM system
  // - Database for audit trail
  // - Alert system for critical events
}

/**
 * Get severity level for event type
 */
function getEventSeverity(type: SecurityEventType): SecurityEvent["severity"] {
  switch (type) {
    case "LOGIN_BLOCKED":
    case "SUSPICIOUS_ACTIVITY":
    case "AUTHORIZATION_FAILURE":
      return "high";
    case "LOGIN_FAILURE":
    case "PASSWORD_RESET_FAILURE":
    case "TOKEN_INVALID":
    case "RATE_LIMIT_EXCEEDED":
      return "medium";
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
    case "PASSWORD_RESET_SUCCESS":
    case "TOKEN_REFRESH":
      return "low";
    default:
      return "medium";
  }
}

/**
 * Log authentication attempt
 */
export function logAuthAttempt(
  success: boolean,
  ip: string,
  email: string,
  options: {
    userId?: string;
    userAgent?: string;
    reason?: string;
  } = {}
): void {
  if (success) {
    logSecurityEvent("LOGIN_SUCCESS", ip, {
      email,
      userId: options.userId,
      userAgent: options.userAgent,
    });
  } else {
    logSecurityEvent("LOGIN_FAILURE", ip, {
      email,
      userId: options.userId,
      userAgent: options.userAgent,
      details: { reason: options.reason || "Invalid credentials" },
    });
  }
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(
  ip: string,
  endpoint: string,
  options: {
    userAgent?: string;
    userId?: string;
  } = {}
): void {
  logSecurityEvent("RATE_LIMIT_EXCEEDED", ip, {
    userAgent: options.userAgent,
    userId: options.userId,
    details: { endpoint },
  });
}

/**
 * Log authorization failure
 */
export function logAuthorizationFailure(
  ip: string,
  userId: string,
  resource: string,
  options: {
    userAgent?: string;
    reason?: string;
  } = {}
): void {
  logSecurityEvent("AUTHORIZATION_FAILURE", ip, {
    userId,
    userAgent: options.userAgent,
    details: {
      resource,
      reason: options.reason || "Insufficient permissions",
    },
  });
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // This should match the IP extraction logic in middleware
  // In production, ensure proper IP extraction behind proxies
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}

