import express from 'express';
import { getPosts, getPostById } from '@controllers/post';

const router = express.Router();

// 获取文章列表
router.get('/', async (req, res) => { 
    try {
        console.log('getPosts');
        await getPosts(req, res); 
    } catch (error) {
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
