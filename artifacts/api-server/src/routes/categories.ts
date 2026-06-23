import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, postsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  const postCounts = await db
    .select({ categoryId: postsTable.categoryId, count: count() })
    .from(postsTable)
    .where(eq(postsTable.published, true))
    .groupBy(postsTable.categoryId);
  const countMap = new Map(postCounts.filter(r => r.categoryId !== null).map((r) => [r.categoryId!, Number(r.count)]));
  const result = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    postCount: countMap.get(c.id) ?? 0,
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
  const [category] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...category, postCount: 0 });
});

export default router;
