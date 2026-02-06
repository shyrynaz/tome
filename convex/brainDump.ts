import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const capture = mutation({
  args: {
    content: v.string(),
    intent: v.union(
      v.literal("TASK"),
      v.literal("EVENT"),
      v.literal("NOTE"),
      v.literal("PLAN"),
      v.literal("UNKNOWN")
    ),
    cleanedText: v.string(),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // 1. Store the original thought in the 'ideas' table
    const ideaId = await ctx.db.insert("ideas", {
      content: args.content,
      userId: userId,
      processed: args.intent !== "UNKNOWN",
      source: "brain_dump",
      intent: args.intent,
      summary: args.summary,
    });

    // 2. If it's a TASK, immediately create a task entry
    if (args.intent === "TASK") {
      await ctx.db.insert("tasks", {
        title: args.cleanedText,
        userId: userId,
        status: "todo",
        priority: args.priority ?? "medium",
      });
    }

    return ideaId;
  },
});
