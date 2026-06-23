import { Router } from "express";
import { db } from "@workspace/db";
import { commentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { DeleteCommentParams } from "@workspace/api-zod";

const router = Router();

router.delete("/:id", async (req, res) => {
  const parsed = DeleteCommentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(commentsTable).where(eq(commentsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
