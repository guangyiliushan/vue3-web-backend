import { Request, Response } from 'express';
import { getPostList, getPostDetails } from '@services/postService';

// 获取文章列表
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search = '', category = '', isTimeline = false } = req.query;

    const result = await getPostList({
      page: Number(page),
      pageSize: Number(pageSize),
      search: String(search),
      category: String(category),
      isTimeline: isTimeline === 'true',
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
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
