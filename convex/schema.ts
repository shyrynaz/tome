import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  entries: defineTable({
    content: v.string(),
    type: v.union(v.literal('note'), v.literal('bookmark')),
    url: v.optional(v.string()),
    urlPreview: v.optional(
      v.object({
        title: v.string(),
        description: v.string(),
        thumbnail: v.string(),
        aiSummary: v.string(),
      })
    ),
    tags: v.array(v.string()),
    folderId: v.optional(v.id('folders')),
    reminderAt: v.optional(v.number()),
    reminderStatus: v.union(
      v.literal('none'),
      v.literal('suggested'),
      v.literal('set'),
      v.literal('completed')
    ),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_type', ['userId', 'type'])
    .index('by_user_and_folder', ['userId', 'folderId'])
    .index('by_user_and_reminder', ['userId', 'reminderAt']),

  folders: defineTable({
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
});
