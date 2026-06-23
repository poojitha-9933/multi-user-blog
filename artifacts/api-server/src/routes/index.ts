import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import authorsRouter from "./authors";
import categoriesRouter from "./categories";
import commentsRouter from "./comments";
import deleteCommentRouter from "./delete-comment";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/posts", postsRouter);
router.use("/authors", authorsRouter);
router.use("/categories", categoriesRouter);
router.use("/posts/:postId/comments", commentsRouter);
router.use("/comments", deleteCommentRouter);

export default router;
