import { Router } from "express";
import { db } from "@workspace/db";
import { authorsTable } from "@workspace/db";
import { postsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  CreateAuthorBody,
  UpdateAuthorBody,
  GetAuthorParams,
  UpdateAuthorParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const authors = await db.select().from(authorsTable).orderBy(authorsTable.createdAt);
  const postCounts = await db
    .select({ authorId: postsTable.authorId, count: count() })
    .from(postsTable)
    .groupBy(postsTable.authorId);
  const countMap = new Map(postCounts.map((r) => [r.authorId, Number(r.count)]));
  const result = authors.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    bio: a.bio,
    avatarUrl: a.avatarUrl,
    postCount: countMap.get(a.id) ?? 0,
    createdAt: a.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const parsed = CreateAuthorBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const [author] = await db.insert(authorsTable).values(parsed.data).returning();
  res.status(201).json({
    ...author,
    postCount: 0,
    createdAt: author.createdAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const parsed = GetAuthorParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  const [author] = await db.select().from(authorsTable).where(eq(authorsTable.id, parsed.data.id));
  if (!author) return res.status(404).json({ error: "Author not found" });
  const [postCount] = await db
    .select({ count: count() })
    .from(postsTable)
    .where(eq(postsTable.authorId, author.id));
  res.json({
    ...author,
    postCount: Number(postCount?.count ?? 0),
    createdAt: author.createdAt.toISOString(),
  });
});

router.patch("/:id", async (req, res) => {
  const parsedParams = UpdateAuthorParams.safeParse({ id: Number(req.params.id) });
  if (!parsedParams.success) return res.status(400).json({ error: "Invalid id" });
  const parsed = UpdateAuthorBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
  const [author] = await db
    .update(authorsTable)
    .set(parsed.data)
    .where(eq(authorsTable.id, parsedParams.data.id))
    .returning();
  if (!author) return res.status(404).json({ error: "Author not found" });
  const [postCount] = await db
    .select({ count: count() })
    .from(postsTable)
    .where(eq(postsTable.authorId, author.id));
  res.json({
    ...author,
    postCount: Number(postCount?.count ?? 0),
    createdAt: author.createdAt.toISOString(),
  });
});

export default router;
