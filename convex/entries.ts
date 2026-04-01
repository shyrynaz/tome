import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    content: v.string(),
    type: v.union(v.literal('note'), v.literal('bookmark')),
    url: v.optional(v.string()),
    folderId: v.optional(v.id('folders')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const now = Date.now();
    const entryId = await ctx.db.insert('entries', {
      content: args.content,
      type: args.type,
      url: args.url,
      tags: [],
      folderId: args.folderId,
      reminderStatus: 'none',
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    return entryId;
  },
});

export const list = query({
  args: {
    type: v.optional(v.union(v.literal('note'), v.literal('bookmark'))),
    folderId: v.optional(v.id('folders')),
    reminderOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let entries;

    if (args.reminderOnly) {
      entries = await ctx.db
        .query('entries')
        .withIndex('by_user_and_reminder', (q) => q.eq('userId', identity.subject))
        .order('desc')
        .filter((q) => q.neq(q.field('reminderAt'), undefined))
        .collect();
    } else if (args.folderId) {
      entries = await ctx.db
        .query('entries')
        .withIndex('by_user_and_folder', (q) =>
          q.eq('userId', identity.subject).eq('folderId', args.folderId)
        )
        .order('desc')
        .collect();
    } else if (args.type) {
      const entryType = args.type;
      entries = await ctx.db
        .query('entries')
        .withIndex('by_user_and_type', (q) =>
          q.eq('userId', identity.subject).eq('type', entryType)
        )
        .order('desc')
        .collect();
    } else {
      entries = await ctx.db
        .query('entries')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .order('desc')
        .collect();
    }

    return entries;
  },
});

export const getById = query({
  args: { id: v.id('entries') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== identity.subject) return null;
    return entry;
  },
});

export const update = mutation({
  args: {
    id: v.id('entries'),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    folderId: v.optional(v.id('folders')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== identity.subject) throw new Error('Not found');
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('entries') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== identity.subject) throw new Error('Not found');
    await ctx.db.delete(args.id);
  },
});

export const setReminderStatus = mutation({
  args: {
    id: v.id('entries'),
    status: v.union(
      v.literal('none'),
      v.literal('suggested'),
      v.literal('set'),
      v.literal('completed')
    ),
    reminderAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== identity.subject) throw new Error('Not found');
    await ctx.db.patch(args.id, {
      reminderStatus: args.status,
      reminderAt: args.reminderAt,
      updatedAt: Date.now(),
    });
  },
});
