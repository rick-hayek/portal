import { router } from './trpc';
import { postRouter } from './routers/post';
import { categoryRouter } from './routers/category';
import { commentRouter } from './routers/comment';
import { guestbookRouter } from './routers/guestbook';
import { searchRouter } from './routers/search';
import { adminRouter } from './routers/admin';
import { portfolioRouter } from './routers/portfolio';
import { analyticsRouter } from './routers/analytics';

export { createContext } from './trpc';

export const appRouter = router({
    post: postRouter,
    category: categoryRouter,
    comment: commentRouter,
    guestbook: guestbookRouter,
    search: searchRouter,
    admin: adminRouter,
    portfolio: portfolioRouter,
    analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
