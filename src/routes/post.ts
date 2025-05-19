import express from 'express';
import { getPosts, getCategories , getTags , getPostById } from '@controllers/post';

const router = express.Router();

// 获取文章列表
router.get('/', async (req, res) => { 
    try {
        await getPosts(req, res); 
    } catch (error) {
         res.status(500).send({ error: 'Internal Server Error' });
    }
});

// 获取分类列表
router.get('/categories', async (req, res) => {
    try {
        await getCategories(req, res);
    }catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// 获取标签列表
router.get('/tags', async (req, res) => {
    try {
        await getTags(req, res);
    }catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    } 
});

// 获取单篇文章详情
router.get('/:id', async (req, res) => {
    try {
        await getPostById(req, res);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;
