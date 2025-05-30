import express from 'express';
import { getPosts, getCategories, getTags, getPostById } from '@controllers/posts';

const router = express.Router();

// 获取文章列表
router.get('/', async (req, res, next) => {
    try {
        await getPosts(req, res , next);
    } catch (error) {
        next(error); 
    }
});

// 获取分类列表
router.get('/categories', async (req, res, next) => {
    try {
        await getCategories(req, res, next);
    } catch (error) {
        next(error); 
    }
});

// 获取标签列表
router.get('/tags', async (req, res, next) => {
    try {
        await getTags(req, res , next);
    } catch (error) {
        next(error); 
    }
});

// 获取单篇文章详情
router.get('/:id', async (req, res, next) => {
    try {
        await getPostById(req, res, next);
    } catch (error) {
        next(error); 
    }
});

export default router;
