import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db.insert('folders', {
      name: args.name,
      color: args.color,
      icon: args.icon,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query('folders')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('asc')
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id('folders'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== identity.subject) throw new Error('Not found');

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id('folders') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== identity.subject) throw new Error('Not found');

    await ctx.db.delete(args.id);
  },
});
