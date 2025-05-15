import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PostQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isTimeline?: boolean;
  cursor?: { createdAt: Date; id: string } | null;
  direction?: 'next' | 'prev';
}

// 获取单篇文章详情
export const getPostDetails = async (id: string) => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      tags: true,
      category: true,
      comments: true,
    }
  });
};

// 获取文章列表
export const getPostList = async (params: PostQueryParams) => {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    category = '',
    isTimeline = false,
    cursor = null,
    direction = 'next',
  } = params;

  const where: any = {
    title: { contains: search },
    ...(category && { categoryId: category }),
  };

  // 时间线查询
  if (isTimeline) {
    const posts = await prisma.post.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    return {
      posts,
      pagination: {
        totalCount: posts.length,
      },
    };
  }

  // 分页查询
  if (!cursor) {
    const skip = (page - 1) * pageSize;

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize + 1,
        orderBy: [
          { createdAt: 'desc' },
          { id: 'asc' }
        ],
        include: { category: true, tags: true },
      }),
      prisma.post.count({ where }),
    ]);

    const hasNextPage = posts.length > pageSize;
    const hasPrevPage = page > 1;

    const paginatedPosts = hasNextPage ? posts.slice(0, pageSize) : posts;

    return {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        hasNextPage,
        hasPrevPage,
        nextCursor: hasNextPage
          ? {
            createdAt: paginatedPosts[paginatedPosts.length - 1].createdAt,
            id: paginatedPosts[paginatedPosts.length - 1].id,
          }
          : null,
        prevCursor: hasPrevPage
          ? {
            createdAt: paginatedPosts[0].createdAt,
            id: paginatedPosts[0].id,
          }
          : null,
      },
    };
  }

  if (direction === 'next') {
    const posts = await prisma.post.findMany({
      where,
      skip: 1,
      take: pageSize + 1,
      cursor: { createdAt: cursor!.createdAt, id: cursor!.id },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'asc' }
      ],
      include: { category: true, tags: true },
    });

    const hasNextPage = posts.length > pageSize;
    const hasPrevPage = true;

    const paginatedPosts = hasNextPage ? posts.slice(0, pageSize) : posts;

    return {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        hasNextPage,
        hasPrevPage,
        nextCursor: hasNextPage
          ? {
            createdAt: paginatedPosts[paginatedPosts.length - 1].createdAt,
            id: paginatedPosts[paginatedPosts.length - 1].id,
          }
          : null,
        prevCursor: {
          createdAt: paginatedPosts[0].createdAt,
          id: paginatedPosts[0].id,
        },
      },
    };
  }

  if (direction === 'prev') {
    const posts = await prisma.post.findMany({
      where,
      skip: 1,
      take: pageSize + 1,
      cursor: { createdAt: cursor!.createdAt, id: cursor!.id },
      orderBy: [
        { createdAt: 'asc' },
        { id: 'asc' }
      ],
      include: { category: true, tags: true },
    });

    const reversedPosts = posts.reverse();
    const hasPrevPage = posts.length > pageSize;
    const hasNextPage = true;

    const paginatedPosts = hasPrevPage
      ? reversedPosts.slice(1, pageSize + 1)
      : reversedPosts;

    console.log(paginatedPosts);
    return {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        hasNextPage,
        hasPrevPage,
        nextCursor: {
          createdAt: paginatedPosts[paginatedPosts.length - 1].createdAt,
          id: paginatedPosts[paginatedPosts.length - 1].id,
        }
        ,
        prevCursor: hasPrevPage
          ? {
            createdAt: paginatedPosts[0].createdAt,
            id: paginatedPosts[0].id,
          }
          : null,
      },
    };
  }
};