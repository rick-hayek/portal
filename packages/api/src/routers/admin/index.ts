import { mergeRouters } from '../../trpc';
import { adminBookRouter } from './book';
import { adminCategoryRouter } from './category';
import { adminCommentRouter } from './comment';
import { adminConfigRouter } from './config';
import { adminGuestbookRouter } from './guestbook';
import { adminLinkRouter } from './link';
import { adminPostRouter } from './post';
import { adminProjectRouter } from './project';
import { adminSearchRouter } from './search';
import { adminStatsRouter } from './stats';
import { adminTrendingRouter } from './trending';

export {
  adminStatsRouter,
  adminPostRouter,
  adminCommentRouter,
  adminGuestbookRouter,
  adminProjectRouter,
  adminBookRouter,
  adminLinkRouter,
  adminConfigRouter,
  adminCategoryRouter,
  adminSearchRouter,
  adminTrendingRouter,
};

export const adminRouter = mergeRouters(
  adminStatsRouter,
  adminPostRouter,
  adminCommentRouter,
  adminGuestbookRouter,
  adminProjectRouter,
  adminBookRouter,
  adminLinkRouter,
  adminConfigRouter,
  adminCategoryRouter,
  adminSearchRouter,
  adminTrendingRouter,
);
