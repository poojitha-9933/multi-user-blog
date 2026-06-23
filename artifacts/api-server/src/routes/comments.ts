import { Router } from "express";
import { db } from "@workspace/db";
import { commentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListCommentsParams,
  CreateCommentParams,
  CreateCommentBody,
  DeleteCommentParams,
} from "@workspace/api-zod";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const parsed = ListCommentsParams.safeParse({ postId: Number(req.params.postId) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid postId" });
  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.postId, parsed.data.postId))
    .orderBy(commentsTable.createdAt);
  res.json(
    comments.map((c) => ({
      id: c.id,
      postId: c.postId,
      authorName: c.authorName,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
    }))
  );
});

router.post("/", async (req, res) => {
  const parsedParams = CreateCommentParams.safeParse({ postId: Number(req.params.postId) });
  if (!parsedParams.success) return res.status(400).json({ error: "Invalid postId" });
  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
  const [comment] = await db
    .insert(commentsTable)
    .values({ ...parsed.data, postId: parsedParams.data.postId })
    .returning();
  res.status(201).json({
    id: comment.id,
    postId: comment.postId,
    authorName: comment.authorName,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  });
});

export default router;
