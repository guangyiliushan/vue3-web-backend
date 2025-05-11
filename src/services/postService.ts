import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PostQueryParams {
  page: number;
  pageSize: number;
  search: string;
  category: string;
  isTimeline: boolean;
}

// 获取文章列表
export const getPostList = async (params: PostQueryParams) => {
  const { page, pageSize, search, category, isTimeline } = params;
  const where: any = {
    title: { contains: search },
    ...(category && { categoryId: category }),
  };
  console.log('where', where);
  const posts = await prisma.post.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: isTimeline ? { updatedAt: 'desc' } : { id: 'asc' },
  });

  const total = await prisma.post.count({ where });

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });

  const tags = await prisma.tag.findMany({
    select: { id: true, name: true },
  });

  return {
    posts,
    total,
    categories,
    tags,
  };
};

// 获取单篇文章详情
export const getPostDetails = async (id: string) => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      tags: true, // 移除嵌套的 include
      category: true,
      comments: true,
    },
  });
};
