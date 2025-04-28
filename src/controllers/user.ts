import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'your_private_key';

export const registerUser = async (req: Request, res: Response) => {
    const { email, password, salt } = req.body;
    if (!email || !password || !salt) {
      return res.status(400).json({ error: 'Email, password, and salt are required.' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }
    try {
      const newUser = await prisma.user.create({
        data: {
          email,
          password, 
          salt,
        },
      });
      // 生成token
      const token = jwt.sign({ id: newUser.id, email: newUser.email }, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' });
      return res.status(201).json({ message: 'User registered successfully.', user: { id: newUser.id, email: newUser.email }, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  };