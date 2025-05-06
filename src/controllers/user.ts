import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getPrivateKey, getSymmetricKey } from "@utils/key";
import { verifyEmailCode } from "@middlewares/verifyCode";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, salt } = req.body;
  if (!email || !password || !salt) {
    return res
      .status(400)
      .json({ error: "Email, password, and salt are required." });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        salt,
      },
    });
    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "A user with this email already exists." });
    }
    return res
      .status(500)
      .json({ error: error.message || "Internal server error." });
  }
};

export const getSalt = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Email not found." });
    }
    return res.status(200).json({ salt: user.salt });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email not found." });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password." });
    }
    const privateKey = getPrivateKey();
    const symmetricKey = getSymmetricKey();
    const token = jwt.sign({ id: user.id }, symmetricKey, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user.id }, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });

    return res
      .status(200)
      .json({ message: "Login successful.", token, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.body.user;
  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const updateUsername = async (req: Request, res: Response) => {
  const { id } = req.body.user;
  const { username } = req.body.user;

  if (!id || !username) {
    return res
      .status(400)
      .json({ error: "User ID and username are required." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username },
    });

    return res
      .status(200)
      .json({ message: "Username updated successfully.", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update username." });
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  const { user } = req.body;
  const { id, email, verifyCode, password, newEmail, newEmailCode } = user;

  if (!id || !newEmail || !newEmailCode) {
    return res.status(400).json({
      error:
        "User ID, new email, and new email verification code are required.",
    });
  }

  try {
    // 使用密码验证
    if (password) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: "User not found." }); 
      }
      if (user.password!== password) {
        return res.status(401).json({ error: "Incorrect password." }); 
      }
    }
    // 使用邮箱验证码验证
    if (email && verifyCode) {
      await verifyEmailCode(req, res, () => {});
    }

    // 验证新邮箱验证码
    if (newEmail && newEmailCode) {
      req.body.user.email = newEmail;
      req.body.user.verifyCode = newEmailCode;
      await verifyEmailCode(req, res, () => {});
    }

    // 更新邮箱
    await prisma.user.update({
      where: { id },
      data: { email: newEmail },
    });

    return res.status(200).json({ message: "Email updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update email." });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { user } = req.body;
  const { id, password, verifyCode, newPassword, newSalt } = user;

  if (!id || !newPassword || !newSalt) {
    return res
      .status(400)
      .json({ error: "User ID and new password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 使用旧密码验证
    if (password) {
      const oldPasswordHash = await prisma.user.findUnique({
        where: { id },
        select: { password: true },
      });
      if (!oldPasswordHash) {
        return res.status(404).json({ error: "User not found." });
      }
      if (oldPasswordHash.password !== password) {
        return res.status(401).json({ error: "Incorrect old password." });
      }
    }

    // 使用邮箱验证码验证
    else if (verifyCode) {
      req.body.user.email = user.email;
      req.body.user.verifyCode = verifyCode;
      await verifyEmailCode(req, res, () => {});
    }

    await prisma.user.update({
      where: { id },
      data: { password: newPassword, salt: newSalt },
    });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update password." });
  }
};
