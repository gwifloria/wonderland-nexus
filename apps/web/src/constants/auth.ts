/**
 * Authentication and authorization constants
 */

/**
 * Admin email address for authorization checks
 */
export const ADMIN_EMAIL = "ghuijue@gmail.com";

/**
 * Check if a given email belongs to an admin user
 * @param email - Email address to check
 * @returns true if the email is an admin email, false otherwise
 */
export function isAdminUser(email?: string | null): boolean {
  return email === ADMIN_EMAIL;
}
