import { Request, Response } from 'express';
import prisma from '../prisma';

/** Slugify a title string */
const slugify = (text: string) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

/** GET /api/blog — public returns PUBLISHED only; admin=true returns all */
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { admin, category, search, page = 1, limit = 20 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const where: any = {};
        if (!admin) where.status = 'PUBLISHED';
        if (category && category !== 'All') where.category = category as string;
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { excerpt: { contains: search as string, mode: 'insensitive' } },
                { tags: { has: search as string } },
            ];
        }

        const [total, posts] = await Promise.all([
            prisma.blogPost.count({ where }),
            prisma.blogPost.findMany({
                where,
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, title: true, slug: true, excerpt: true,
                    coverImage: true, category: true, tags: true,
                    status: true, authorName: true, views: true,
                    createdAt: true, updatedAt: true,
                },
            }),
        ]);

        res.json({ success: true, posts, pagination: { total, page: pageNumber, limit: limitNumber, pages: Math.ceil(total / limitNumber) } });
    } catch (error: any) {
        console.error('[Blog] getAllPosts error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
};

/** GET /api/blog/:slug — returns single post + increments views */
export const getPostBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const post = await prisma.blogPost.findUnique({ where: { slug } });
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        // Increment views without waiting
        prisma.blogPost.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => { });

        res.json({ success: true, post });
    } catch (error: any) {
        console.error('[Blog] getPostBySlug error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch post' });
    }
};

/** POST /api/blog — admin only */
export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, excerpt, content, coverImage, category, tags, status, authorName } = req.body;
        if (!title || !content || !excerpt) {
            return res.status(400).json({ success: false, message: 'title, excerpt and content are required' });
        }

        // Auto-generate slug from title, ensure uniqueness
        let slug = slugify(title);
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) slug = `${slug}-${Date.now()}`;

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                coverImage: coverImage || null,
                category: category || 'General',
                tags: Array.isArray(tags) ? tags : [],
                status: status || 'DRAFT',
                authorName: authorName || 'Paybills Team',
            },
        });

        res.status(201).json({ success: true, post });
    } catch (error: any) {
        console.error('[Blog] createPost error:', error);
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
};

/** PUT /api/blog/:id — admin only */
export const updatePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, excerpt, content, coverImage, category, tags, status, authorName, slug } = req.body;

        const data: any = {};
        if (title !== undefined) data.title = title;
        if (excerpt !== undefined) data.excerpt = excerpt;
        if (content !== undefined) data.content = content;
        if (coverImage !== undefined) data.coverImage = coverImage || null;
        if (category !== undefined) data.category = category;
        if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
        if (status !== undefined) data.status = status;
        if (authorName !== undefined) data.authorName = authorName;
        if (slug !== undefined) data.slug = slug;

        const post = await prisma.blogPost.update({ where: { id }, data });
        res.json({ success: true, post });
    } catch (error: any) {
        console.error('[Blog] updatePost error:', error);
        res.status(500).json({ success: false, message: 'Failed to update post' });
    }
};

/** DELETE /api/blog/:id — admin only */
export const deletePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.blogPost.delete({ where: { id } });
        res.json({ success: true, message: 'Post deleted' });
    } catch (error: any) {
        console.error('[Blog] deletePost error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
};
