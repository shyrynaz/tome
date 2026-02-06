import { action } from "./_generated/server";
import { v } from "convex/values";

export const summarizeUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return "Missing API Key for summarization.";
    }

    try {
      // 1. Fetch the page title and basic content if possible
      // In a real app, we'd use a more robust scraper
      const response = await fetch(args.url);
      const html = await response.text();
      
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : args.url;

      // 2. Ask OpenAI to summarize based on the title and URL
      // (Better scraping would provide more context here)
      const prompt = `
        A user shared this link to their "Tome" (a personal intelligence archive).
        URL: ${args.url}
        Title: ${title}

        Please provide:
        1. A 1-sentence summary of what this probably is.
        2. Three key topics it likely covers.
        3. A suggested category (e.g., Reading, Tool, Reference).

        Format as a clean note.
      `;

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      });

      const data = (await aiResponse.json()) as any;
      return data.choices[0].message.content as string;
    } catch (error) {
      console.error("Scraping/Summarization Error:", error);
      return `Link captured: ${args.url}. (AI summarization failed)`;
    }
  },
});
