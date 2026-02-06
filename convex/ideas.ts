import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const search = query({
  args: { query: v.string(), intent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let ideasQuery = ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject));
    
    const ideas = await ideasQuery.order("desc").collect();
      
    return ideas.filter(idea => {
        const matchesQuery = args.query === "" || idea.content.toLowerCase().includes(args.query.toLowerCase());
        const matchesIntent = !args.intent || args.intent === "all" || idea.intent === args.intent;
        return matchesQuery && matchesIntent;
    });
  },
});
