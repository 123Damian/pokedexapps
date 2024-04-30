import { Injectable } from '@nestjs/common';
import { User } from '../db/users';
import * as usersDB from '../db/users';
import { getSalt, hashPassword } from '../helpers/hashPassword';

@Injectable()
export class AuthService {
  async createUser(user: { email: string, password: string }): Promise<void> {
    // Check for valid email
    if (!user.email || user.email.length < 5 || !user.email.includes('@')) {
      throw new Error('Invalid email');
    }

    // Check if user with email already exists
    const existingUser = await usersDB.findByEmail(user.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Check for valid password
    if (!user.password || user.password.length < 8) {
      throw new Error('Password too short');
    }

    // Generate salt and hash password
    const salt = getSalt();
    const hashedPassword = hashPassword(salt + user.password);

    // Create user object with hashed password
    const userWithHash: User = {
      email: user.email,
      hash: hashedPassword,
      salt: salt
    };

    // Save user to the database
    await usersDB.createUser(userWithHash);
  }

  async authenticateUser(user: { email: string, password: string }): Promise<{ email: string }> {
    // Find user by email
    const existingUser = await usersDB.findByEmail(user.email);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Verify password
    const hashedPassword = hashPassword(existingUser.salt + user.password);
    if (hashedPassword !== existingUser.hash) {
      throw new Error('Invalid password');
    }

    // Return user email
    return { email: existingUser.email };
  }
}