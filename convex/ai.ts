import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

export const tagEntry = action({
  args: { entryId: v.id('entries') },
  handler: async (ctx, args) => {
    const entry = await ctx.runQuery(api.entries.getById, { id: args.entryId });
    if (!entry) return;

    const content = entry.content.toLowerCase();
    const tags: string[] = [];

    const tagMap: Record<string, string[]> = {
      work: ['meeting', 'deadline', 'project', 'client', 'email', 'report'],
      personal: ['home', 'family', 'friend', 'health', 'gym', 'doctor'],
      ideas: ['idea', 'thought', 'what if', 'maybe', 'concept'],
      finance: ['money', 'budget', 'pay', 'bill', 'invoice', 'salary'],
      travel: ['flight', 'hotel', 'trip', 'vacation', 'book'],
    };

    for (const [tag, keywords] of Object.entries(tagMap)) {
      if (keywords.some((kw) => content.includes(kw))) {
        tags.push(tag);
      }
    }

    if (tags.length === 0) tags.push('inbox');

    await ctx.runMutation(api.entries.update, {
      id: args.entryId,
      tags,
    });
  },
});

export const suggestReminder = action({
  args: { entryId: v.id('entries') },
  handler: async (ctx, args) => {
    const entry = await ctx.runQuery(api.entries.getById, { id: args.entryId });
    if (!entry) return;

    const content = entry.content.toLowerCase();
    const timeKeywords = [
      'tomorrow',
      'next week',
      'friday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'saturday',
      'sunday',
      'by end of',
      "don't forget",
      'remember to',
    ];

    const hasTimeRef = timeKeywords.some((kw) => content.includes(kw));
    if (hasTimeRef) {
      await ctx.runMutation(api.entries.setReminderStatus, {
        id: args.entryId,
        status: 'suggested',
      });
    }
  },
});

export const summarizeUrl = action({
  args: {
    entryId: v.id('entries'),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const summary = 'AI summary will be generated here after fetching URL content.';

    await ctx.runMutation(api.entries.update, {
      id: args.entryId,
      tags: ['bookmark'],
    });
  },
});
