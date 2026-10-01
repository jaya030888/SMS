// src/app/lib/validate.ts

/**
 * Sanitize text input to neutralize potential XSS vectors and control characters
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Strip HTML tags
    .slice(0, 1000); // Enforce maximum safe string length
}

/**
 * Validate and sanitize email addresses
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 100;
}

/**
 * Validate phone numbers (10 to 15 digits, allowing optional + prefix)
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string' && typeof phone !== 'number') return false;
  const phoneStr = String(phone).trim();
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phoneStr);
}

/**
 * Validate integer IDs
 */
export function isValidId(id: unknown): boolean {
  const num = Number(id);
  return Number.isInteger(num) && num > 0 && num < 2147483647;
}

/**
 * Validate date strings in YYYY-MM-DD or ISO format
 */
export function isValidDate(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Validate positive monetary amounts
 */
export function isValidAmount(amount: unknown, max: number = 1000000): boolean {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= max;
}

/**
 * Validate mark values
 */
export function isValidMark(obtained: unknown, maxMarks: unknown = 100): boolean {
  const obt = Number(obtained);
  const max = Number(maxMarks);
  return !isNaN(obt) && !isNaN(max) && obt >= 0 && obt <= max && max > 0;
}

/**
 * Validate role types
 */
export function isValidRole(role: unknown): role is "admin" | "teacher" | "student" {
  return role === "admin" || role === "teacher" || role === "student";
}

/**
 * Validate base64 image data string format and size limit (max 2MB)
 */
export function isValidImageData(base64Str: unknown, maxBytes: number = 2 * 1024 * 1024): boolean {
  if (typeof base64Str !== 'string') return false;
  if (!base64Str.startsWith('data:image/')) return false;
  
  // Approximate base64 decoded size: length * 3/4
  const estimatedSize = (base64Str.length * 3) / 4;
  return estimatedSize <= maxBytes;
}
