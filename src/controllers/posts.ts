import { Request, Response , NextFunction } from 'express';
import { getPostList, getPostDetails } from '@services/postService';
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@middlewares/error';

const prisma = new PrismaClient();

// 获取文章列表
export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      pageSize = '5',
      search = '',
      category = '',
      timeline = 'false',
      cursor = null,
      direction = 'next',
    } = req.query;

    const result = await getPostList({
      page: Number(page),
      pageSize: Number(pageSize),
      search: String(search),
      category: String(category),
      timeline: timeline === 'true',
      cursor: cursor ? JSON.parse(String(cursor)) : null,
      direction: direction === 'prev' ? 'prev' : 'next',
    });
    res.success(result);
  } catch (error) {
    next(error);
  }
};

// 获取单篇文章详情
export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const post = await getPostDetails(String(id));
    if (!post) {
      return next(new NotFoundError('Post not found'));
    }
    res.success(post);
  } catch (error) {
    next(error);
  }
};

// 获取分类列表
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany();
    res.success(categories);
  } catch (error) {
    next(error);
  }
};

// 获取标签列表
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.tag.findMany();
    res.success(tags);
  } catch (error) {
    next(error);
  }
};