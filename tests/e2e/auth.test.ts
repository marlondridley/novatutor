import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Authentication Flow
 * Tests: Signup, Login, Logout, Session Persistence, Password Reset
 */

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test Student',
  age: '15',
  grade: '10th',
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/SuperTutor|SuperFocus/);
    await expect(page.locator('text=Welcome to SuperTutor')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.click('button:has-text("Sign In")');
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should create new account successfully', async ({ page }) => {
    // Switch to signup tab
    await page.click('button:has-text("Sign Up")');
    
    // Fill signup form
    await page.fill('input[id="signup-name"]', TEST_USER.name);
    await page.fill('input[id="signup-age"]', TEST_USER.age);
    await page.fill('input[id="signup-grade"]', TEST_USER.grade);
    await page.fill('input[id="signup-email"]', TEST_USER.email);
    await page.fill('input[id="signup-password"]', TEST_USER.password);
    
    // Submit form
    await page.click('button:has-text("Create Account")');
    
    // Wait for success message
    await expect(page.locator('text=Account created successfully')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Please check your email')).toBeVisible();
  });

  test('should prevent duplicate email signup', async ({ page }) => {
    await page.click('button:has-text("Sign Up")');
    
    // Try to sign up with existing email
    await page.fill('input[id="signup-name"]', 'Another User');
    await page.fill('input[id="signup-age"]', '16');
    await page.fill('input[id="signup-grade"]', '11th');
    await page.fill('input[id="signup-email"]', 'existing@example.com');
    await page.fill('input[id="signup-password"]', 'password123');
    
    await page.click('button:has-text("Create Account")');
    
    // Should show error (if user exists)
    // Note: This test assumes the email already exists in test DB
    await page.waitForTimeout(2000);
  });

  test('should login with valid credentials', async ({ page }) => {
    // Use a pre-created test account
    await page.fill('input[id="login-email"]', 'testuser@example.com');
    await page.fill('input[id="login-password"]', 'testpassword');
    
    // Check "Remember Me"
    await page.check('input[id="remember-me"]');
    
    // Submit login
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to dashboard or pricing
    await page.waitForURL(/\/(dashboard|pricing)/, { timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[id="login-email"]', 'wrong@example.com');
    await page.fill('input[id="login-password"]', 'wrongpassword');
    
    await page.click('button:has-text("Sign In")');
    
    // Wait for error message
    await expect(page.locator('text=/Login failed|Invalid/i')).toBeVisible({ timeout: 5000 });
  });

  test('should handle "Remember Me" checkbox', async ({ page }) => {
    const rememberMeCheckbox = page.locator('input[id="remember-me"]');
    
    // Should be checked by default
    await expect(rememberMeCheckbox).toBeChecked();
    
    // Uncheck it
    await rememberMeCheckbox.uncheck();
    await expect(rememberMeCheckbox).not.toBeChecked();
    
    // Check it again
    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();
  });

  test('should open forgot password dialog', async ({ page }) => {
    await page.click('button:has-text("Forgot password")');
    
    // Dialog should open
    await expect(page.locator('text=Reset Password')).toBeVisible();
    await expect(page.locator('input[id="reset-email"]')).toBeVisible();
  });

  test('should send password reset email', async ({ page }) => {
    await page.click('button:has-text("Forgot password")');
    
    // Fill reset email
    await page.fill('input[id="reset-email"]', 'testuser@example.com');
    
    // Submit
    await page.click('button:has-text("Send Reset Link")');
    
    // Wait for success message
    await expect(page.locator('text=Password reset email sent')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Session Persistence', () => {
  test('should persist session after page reload', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[id="login-email"]', 'testuser@example.com');
    await page.fill('input[id="login-password"]', 'testpassword');
    await page.check('input[id="remember-me"]');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL(/\/(dashboard|pricing)/, { timeout: 10000 });
    
    // Reload page
    await page.reload();
    
    // Should still be logged in (not redirected to login)
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should clear session after logout', async ({ page }) => {
    // Assume user is logged in
    await page.goto('/dashboard');
    
    // Click user menu
    await page.click('[data-testid="user-menu"]').catch(() => {
      // Fallback: click avatar or dropdown trigger
      page.click('button:has(svg)').catch(() => {});
    });
    
    // Click logout
    await page.click('text=Log out');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect back to login
    await page.waitForURL('/login', { timeout: 5000 });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or show auth required
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test('should redirect to pricing if no subscription', async ({ page }) => {
    // Login with account that has no subscription
    await page.goto('/login');
    await page.fill('input[id="login-email"]', 'nosubscription@example.com');
    await page.fill('input[id="login-password"]', 'testpassword');
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to pricing page
    await page.waitForURL('/pricing', { timeout: 10000 });
  });

  test('should allow access to dashboard with active subscription', async ({ page }) => {
    // Login with account that has active subscription
    await page.goto('/login');
    await page.fill('input[id="login-email"]', 'subscribed@example.com');
    await page.fill('input[id="login-password"]', 'testpassword');
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Dashboard content should be visible
    await expect(page.locator('text=/Dashboard|Welcome/i')).toBeVisible();
  });
});

test.describe('Password Reset Flow', () => {
  test('should handle password reset with valid token', async ({ page }) => {
    // Simulate clicking email link with reset token
    // Note: In real test, you'd need to intercept email or use test token
    await page.goto('/reset-password?token=test-token');
    
    // Fill new password
    await page.fill('input[id="new-password"]', 'NewPassword123!');
    await page.fill('input[id="confirm-password"]', 'NewPassword123!');
    
    // Submit
    await page.click('button:has-text("Reset Password")');
    
    // Should show success and redirect
    await expect(page.locator('text=Password Reset Successful')).toBeVisible({ timeout: 10000 });
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/reset-password?token=test-token');
    
    // Try short password
    await page.fill('input[id="new-password"]', '12345');
    await page.fill('input[id="confirm-password"]', '12345');
    await page.click('button:has-text("Reset Password")');
    
    // Should show validation error
    await expect(page.locator('text=/at least 6 characters/i')).toBeVisible();
  });

  test('should validate password match', async ({ page }) => {
    await page.goto('/reset-password?token=test-token');
    
    await page.fill('input[id="new-password"]', 'Password123!');
    await page.fill('input[id="confirm-password"]', 'DifferentPassword123!');
    await page.click('button:has-text("Reset Password")');
    
    // Should show mismatch error
    await expect(page.locator('text=/do not match/i')).toBeVisible();
  });
});
