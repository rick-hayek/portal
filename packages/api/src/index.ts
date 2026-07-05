import { adminRouter } from './routers/admin';
import { analyticsRouter } from './routers/analytics';
import { bookRouter } from './routers/book';
import { categoryRouter } from './routers/category';
import { commentRouter } from './routers/comment';
import { galleryRouter } from './routers/gallery';
import { guestbookRouter } from './routers/guestbook';
import { linkRouter } from './routers/link'; // Added import for linkRouter
import { portfolioRouter } from './routers/portfolio';
import { postRouter } from './routers/post';
import { profileRouter } from './routers/profile';
import { referenceRouter } from './routers/reference';
import { searchRouter } from './routers/search';
import { attachmentRouter } from './routers/attachment';
import { trendingRouter } from './routers/trending';
import { router } from './trpc';

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
  gallery: galleryRouter,
  link: linkRouter, // Registered linkRouter
  reference: referenceRouter,
  book: bookRouter,
  profile: profileRouter,
  attachment: attachmentRouter,
  trending: trendingRouter,
});

export type AppRouter = typeof appRouter;
