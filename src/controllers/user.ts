import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
import { getPublicKey } from '@utils/key';

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, salt } = req.body;
  if (!email || !password || !salt) {
    return res.status(400).json({ error: 'Email, password, and salt are required.' });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        salt,
      },
    });
    return res.status(201).json({ message: 'User registered successfully.', user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getSalt = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json({ salt: user.salt });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ error: 'Invalid email or password.' });
    // }
    const token = jwt.sign({ id: user.id, email: user.email }, getPublicKey()!, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Login successful.', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}