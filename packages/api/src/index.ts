import { router } from './trpc';
import { postRouter } from './routers/post';
import { categoryRouter } from './routers/category';
import { commentRouter } from './routers/comment';
import { guestbookRouter } from './routers/guestbook';

export { createContext } from './trpc';

export const appRouter = router({
    post: postRouter,
    category: categoryRouter,
    comment: commentRouter,
    guestbook: guestbookRouter,
});

export type AppRouter = typeof appRouter;
