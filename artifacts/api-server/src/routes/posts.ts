import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, authorsTable, categoriesTable, commentsTable } from "@workspace/db";
import { eq, count, ilike, and, or, desc } from "drizzle-orm";
import {
  ListPostsQueryParams,
  CreatePostBody,
  GetPostParams,
  UpdatePostParams,
  UpdatePostBody,
  DeletePostParams,
} from "@workspace/api-zod";

const router = Router();

function calcReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function buildPostResponse(post: typeof postsTable.$inferSelect) {
  const [author] = await db.select().from(authorsTable).where(eq(authorsTable.id, post.authorId));
  const category = post.categoryId
    ? (await db.select().from(categoriesTable).where(eq(categoriesTable.id, post.categoryId)))[0]
    : null;
  const [commentCount] = await db
    .select({ count: count() })
    .from(commentsTable)
    .where(eq(commentsTable.postId, post.id));
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    authorId: post.authorId,
    authorName: author?.name ?? "Unknown",
    authorAvatarUrl: author?.avatarUrl ?? null,
    categoryId: post.categoryId,
    categoryName: category?.name ?? null,
    published: post.published,
    readingTimeMinutes: calcReadingTime(post.content),
    commentCount: Number(commentCount?.count ?? 0),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

router.get("/stats/summary", async (req, res) => {
  const [totalPosts] = await db.select({ count: count() }).from(postsTable);
  const [publishedPosts] = await db.select({ count: count() }).from(postsTable).where(eq(postsTable.published, true));
  const [totalAuthors] = await db.select({ count: count() }).from(authorsTable);
  const [totalCategories] = await db.select({ count: count() }).from(categoriesTable);
  const [totalComments] = await db.select({ count: count() }).from(commentsTable);
  res.json({
    totalPosts: Number(totalPosts?.count ?? 0),
    publishedPosts: Number(publishedPosts?.count ?? 0),
    totalAuthors: Number(totalAuthors?.count ?? 0),
    totalCategories: Number(totalCategories?.count ?? 0),
    totalComments: Number(totalComments?.count ?? 0),
  });
});

router.get("/recent", async (req, res) => {
  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.published, true))
    .orderBy(desc(postsTable.createdAt))
    .limit(5);
  const results = await Promise.all(posts.map(buildPostResponse));
  res.json(results);
});

router.get("/", async (req, res) => {
  const parsed = ListPostsQueryParams.safeParse({
    categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    authorId: req.query.authorId ? Number(req.query.authorId) : undefined,
    search: req.query.search,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined,
  });
  if (!parsed.success) return res.status(400).json({ error: "Invalid query params" });

  const { categoryId, authorId, search, limit = 20, offset = 0 } = parsed.data;

  const conditions = [eq(postsTable.published, true)];
  if (categoryId) conditions.push(eq(postsTable.categoryId, categoryId));
  if (authorId) conditions.push(eq(postsTable.authorId, authorId));
  if (search) {
    conditions.push(
      or(
        ilike(postsTable.title, `%${search}%`),
        ilike(postsTable.content, `%${search}%`)
      )!
    );
  }

  const posts = await db
    .select()
    .from(postsTable)
    .where(and(...conditions))
    .orderBy(desc(postsTable.createdAt))
    .limit(limit ?? 20)
    .offset(offset ?? 0);

  const results = await Promise.all(posts.map(buildPostResponse));
  res.json(results);
});

router.post("/", async (req, res) => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
  const now = new Date();
  const [post] = await db
    .insert(postsTable)
    .values({ ...parsed.data, createdAt: now, updatedAt: now })
    .returning();
  const result = await buildPostResponse(post);
  res.status(201).json(result);
});

router.get("/:id", async (req, res) => {
  const parsed = GetPostParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, parsed.data.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  const result = await buildPostResponse(post);
  res.json(result);
});

router.patch("/:id", async (req, res) => {
  const parsedParams = UpdatePostParams.safeParse({ id: Number(req.params.id) });
  if (!parsedParams.success) return res.status(400).json({ error: "Invalid id" });
  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
  const [post] = await db
    .update(postsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(postsTable.id, parsedParams.data.id))
    .returning();
  if (!post) return res.status(404).json({ error: "Post not found" });
  const result = await buildPostResponse(post);
  res.json(result);
});

router.delete("/:id", async (req, res) => {
  const parsed = DeletePostParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(postsTable).where(eq(postsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
