import { z } from 'zod';
import { findAllUser as fetchAllUsers, findByEmail, findByUsername, userExists, verifyPassword, save, updatePassword, updateUsername, updateImage, deleteByEmail } from '../services/user_service.js';
import { createTree } from '../services/tree_service.js';
import { ok, fail } from '../middleware/response.js';

const emailParam = z.email();
const usernameParam = z.string().min(1);
const checkUserSchema = z.object({
  email: z.email(),
});
const verifyPasswordSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
const registerSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});
const changePasswordSchema = z.object({
  email: z.email(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
const changeUsernameSchema = z.object({
  email: z.email(),
  newUsername: z.string().min(1),
});
const deleteAccountSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function getAllUsers(req, res, next) {
  try {
    const users = await fetchAllUsers();
    return ok(res, users);
  } catch (error) {
    next(error);
  }
}

export async function getUserByEmail(req, res, next) {
  try {
    const email = emailParam.parse(req.query.email);
    const user = await findByEmail(email);
    if (!user) return fail(res, 'User not found');
    return ok(res, user);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Invalid email format');
    next(error);
  }
}

export async function getUserByUsername(req, res, next) {
  try {
    const username = usernameParam.parse(req.query.username);
    const user = await findByUsername(username);
    if (!user) return fail(res, 'User not found');
    return ok(res, user);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Invalid username');
    next(error);
  }
}

export async function checkUserExists(req, res, next) {
  try {
    const { email } = checkUserSchema.parse(req.query);
    const result = await userExists(email);
    return ok(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid email is required');
    next(error);
  }
}

export async function checkPassword(req, res, next) {
  try {
    const { email, password } = verifyPasswordSchema.parse(req.body);
    const result = await verifyPassword(email, password);
    if (!result.found) return fail(res, 'User not found');
    if (!result.match) return fail(res, 'Incorrect password');
    return ok(res, { verified: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Email and password are required');
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const { exists } = await userExists(email);
    if (exists) return fail(res, 'Email already registered');
    const user = await save(username, email, password);
    await createTree(user.id);
    return ok(res, user);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, error.issues.map(i => i.message));
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { email, currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const result = await verifyPassword(email, currentPassword);
    if (!result.found) return fail(res, 'User not found');
    if (!result.match) return fail(res, 'Incorrect password');
    await updatePassword(email, newPassword);
    return ok(res, { updated: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Email, current password and new password (min 6 chars) are required');
    next(error);
  }
}

export async function changeUsername(req, res, next) {
  try {
    const { email, newUsername } = changeUsernameSchema.parse(req.body);
    const updated = await updateUsername(email, newUsername);
    if (!updated) return fail(res, 'User not found');
    return ok(res, { updated: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Email and new username are required');
    next(error);
  }
}

export async function uploadImage(req, res, next) {
  try {
    const email = req.body.email;
    if (!email || !req.file) return fail(res, 'Email and image file are required');
    const imageUrl = `/uploads/${req.file.filename}`;
    const updated = await updateImage(email, imageUrl);
    if (!updated) return fail(res, 'User not found');
    return ok(res, { imageUrl });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const { email, password } = deleteAccountSchema.parse(req.body);
    const result = await verifyPassword(email, password);
    if (!result.found) return fail(res, 'User not found');
    if (!result.match) return fail(res, 'Incorrect password');
    await deleteByEmail(email);
    return ok(res, { deleted: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Email and password are required');
    next(error);
  }
}
