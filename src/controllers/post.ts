import { Request, Response } from 'express';
import { getPostList, getPostDetails } from '@services/postService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 获取文章列表
export const getPosts = async (req: Request, res: Response) => {
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
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts'+ error });
  }
};

// 获取单篇文章详情
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await getPostDetails(String(id));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post details' });
  }
};

// 获取分类列表
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch categories' });
  }
};

// 获取标签列表
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch tags' });
  }
};