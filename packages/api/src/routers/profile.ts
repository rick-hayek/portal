import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const profileRouter = router({
  /** Get current logged-in user profile */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      hasPassword: user.passwordHash !== null,
    };
  }),

  /** Securely change user password */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().optional(),
        newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // If user has a local password hash, verify current password
      if (user.passwordHash) {
        if (!input.currentPassword) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Current password is required',
          });
        }

        const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Incorrect current password',
          });
        }
      }

      // Hash and update to the new password
      const newPasswordHash = await bcrypt.hash(input.newPassword, 12);
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { passwordHash: newPasswordHash },
      });

      return { success: true };
    }),
});
