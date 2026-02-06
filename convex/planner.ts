import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateDailyPlan = action({
  args: {
    userId: v.string(), // Keeping for compatibility, but using identity
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // 1. Fetch the user's unprocessed ideas and recent tasks
    const ideas = (await ctx.runQuery(api.ideas.list, { userId: identity.subject })) as any[];
    const tasks = (await ctx.runQuery(api.tasks.list)) as any[];

    if (ideas.length === 0 && tasks.length === 0) {
      return "No data to plan with yet.";
    }

    // 2. Prepare the prompt for the AI
    const context = `
      User Ideas: ${ideas.map(i => i.content).join('; ')}
      Current Tasks: ${tasks.map(t => t.title).join('; ')}
    `;

    const prompt = `
      You are an elite productivity assistant. Based on the following messy thoughts and existing tasks, 
      create a structured daily plan for today. 
      Identify:
      1. One "Main Focus" task.
      2. Three "High Impact" sub-tasks.
      3. A suggested schedule for the afternoon.

      Context: ${context}
      
      Respond in a concise, motivational tone.
    `;

    // 3. Call the Cloud AI (e.g., OpenAI)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return "AI Planner is offline (Missing API Key). Here is your raw data: " + context;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = (await response.json()) as any;
      return data.choices[0].message.content as string;
    } catch (error) {
      console.error("Cloud AI Error:", error);
      return "The Cloud AI is having a moment. Please try again later.";
    }
  },
});
