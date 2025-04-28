import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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