import { findAllUser as fetchAllUsers } from '../services/user_service.js';

export async function getAllUsers(req, res) {
  try {
    const users = await fetchAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
}