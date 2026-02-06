import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("done"),
      v.literal("archived")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    dueDate: v.optional(v.number()), // timestamp
    userId: v.string(), // We'll link this to auth later
  }).index("by_user", ["userId"]),

  ideas: defineTable({
    content: v.string(),
    source: v.optional(v.string()), // e.g., "link", "voice", "manual"
    userId: v.string(),
    processed: v.boolean(), // whether it has been turned into a task or archived
    intent: v.optional(v.string()), // Store the AI detected intent
    summary: v.optional(v.string()), // For shared links/long notes
  }).index("by_user", ["userId"]),

  profiles: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    preferences: v.optional(v.any()),
  }).index("by_user", ["userId"]),
});
