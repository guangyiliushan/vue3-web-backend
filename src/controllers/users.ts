import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getPrivateKey, getSymmetricKey } from "@utils/key";
import { validateEmailCode } from "@services/verifyService";
import { ValidationError, NotFoundError, AuthenticationError, ConflictError } from "@middlewares/error";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, salt, verifyCode } = req.body;
  if (!email || !password || !salt || !verifyCode) {
    return next(new ValidationError("Email, password, verifyCode and salt are required."));
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ConflictError("Email is already in use."));
    }
    const verifyResult = await validateEmailCode("register", email, verifyCode);
    if (!verifyResult.valid) {
      return next(new ValidationError(verifyResult.message || "Invalid verification code."));
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        salt,
      },
    });

    return res.success({
      message: "User registered successfully.",
      user: { id: newUser.id, email: newUser.email }
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      next(new ConflictError("A user with this email already exists."));
    } else {
      next(error);
    }
  }
};

export const getSalt = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return next(new ValidationError("Email is required."));
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new NotFoundError("Email not found."));
    }

    res.success({ salt: user.salt });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ValidationError("Email and password are required."));
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthenticationError("Email not found."));
    }
    if (user.password !== password) {
      return next(new AuthenticationError("Invalid password."));
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

    res.success({ message: "Login successful.", token, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body.auth;
  if (!id) {
    return next(new ValidationError("User ID is required."));
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, createdAt: true },
    });
    if (!user) {
      return next(new NotFoundError("User not found."));
    }

    // 使用 res.success 返回数据
    res.success({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUsername = async (req: Request, res: Response, next: NextFunction) => {
  const { id, username } = req.body.user;

  if (!id || !username) {
    return next(new ValidationError("User ID and username are required."));
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username },
    });

    // 使用 res.success 返回数据
    res.success({
      message: "Username updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.body;
  const { id, oldEmailCode, password, newEmail, newEmailCode } = user;

  if (!id || !newEmail || !newEmailCode) {
    return next(new ValidationError("User ID, new email, and new email verification code are required."));
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return next(new NotFoundError("User not found."));
    }

    if (user.email === newEmail) {
      return next(new ConflictError("New email cannot be the same as old email."));
    }

    // 使用密码验证
    if (password && password.trim() !== '') {
      if (user.password !== password) {
        return next(new AuthenticationError("Incorrect password."));
      }
    }
    // 使用旧邮箱验证码验证
    else if (oldEmailCode && oldEmailCode.trim() !== '') {
      // 直接使用服务层函数进行验证
      const oldEmailResult = await validateEmailCode(id, user.email, oldEmailCode);
      if (!oldEmailResult.valid) {
        return next(new ValidationError(oldEmailResult.message || "Invalid old email verification code."));
      }
    }
    else {
      return next(new ValidationError("Incorrect update email ways."));
    }

    // 验证新邮箱验证码
    if (newEmail && newEmailCode) {
      // 直接使用服务层函数进行验证
      const newEmailResult = await validateEmailCode(id, newEmail, newEmailCode);
      if (!newEmailResult.valid) {
        return next(new ValidationError(newEmailResult.message || "Invalid new email verification code."));
      }
    }

    // 更新邮箱
    await prisma.user.update({
      where: { id },
      data: { email: newEmail },
    });

    return res.success({ message: "Email updated successfully." });
  } catch (error) {
    return next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.body;
  const { id, oldPassword, verifyCode, newPassword, newSalt } = user;

  if (!id || !newPassword || !newSalt) {
    return next(new ValidationError("User ID and new password are required."));
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return next(new NotFoundError("User not found."));
    }

    // 使用旧密码验证
    if (oldPassword && oldPassword.trim() !== '' && oldPassword !== newPassword) {
      if (user.password !== oldPassword) {
        return next(new AuthenticationError("Incorrect password."));
      }
    }
    // 使用邮箱验证码验证
    else if (verifyCode && verifyCode.trim() !== '') {
      // 直接使用服务层函数进行验证
      const verifyResult = await validateEmailCode(id, user.email, verifyCode);
      if (!verifyResult.valid) {
        return next(new ValidationError(verifyResult.message || "Invalid email verification code."));
      }
    }
    else {
      return next(new ValidationError("Incorrect update password ways."));
    }

    await prisma.user.update({
      where: { id },
      data: { password: newPassword, salt: newSalt },
    });

    return res.success({ message: "Password updated successfully." });
  } catch (error) {
    return next(error);
  }
};
