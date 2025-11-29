
'use server';
/**
 * @fileOverview An AI agent that uses a (mock) Google Search tool to find inspirational projects on the web.
 *
 * - discoverWebProjects - Analyzes a query and finds projects online.
 * - WebDiscoveryInput - Input for the web discovery flow.
 * - WebDiscoveryOutput - Output from the web discovery flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WebDiscoveryInputSchema = z.object({
  query: z.string().describe('A natural language query from the user.'),
});
export type WebDiscoveryInput = z.infer<typeof WebDiscoveryInputSchema>;

const WebProjectSchema = z.object({
    name: z.string().describe("The name of the architectural project found."),
    description: z.string().describe("A brief, one-sentence description of the project."),
    imageUrl: z.string().url().describe("A direct URL to a representative image. Use a placeholder like 'https://placehold.co/800x600.png' if a real one isn't available."),
    source: z.string().describe("The source website or publication name (e.g., 'ArchDaily', 'Dezeen')."),
    sourceUrl: z.string().url().describe("The direct URL to the project page on the source website.")
});

const WebDiscoveryOutputSchema = z.object({
  webProjects: z.array(WebProjectSchema).describe("A list of up to 2 architectural projects found on the web."),
});
export type WebDiscoveryOutput = z.infer<typeof WebDiscoveryOutputSchema>;


// MOCK TOOL: This simulates a Google Search tool for demonstration purposes.
const googleSearchTool = ai.defineTool(
    {
      name: 'googleSearchTool',
      description: 'Searches Google for architectural projects matching a query.',
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.string().describe("Mock search results as a JSON string."),
    },
    async ({ query }) => {
      console.log(`MOCK TOOL: Searching for "${query}"`);
      // In a real implementation, this would call the Google Search API.
      // Here, we return a mock JSON string of results in English to avoid language confusion for the model.
      return JSON.stringify([
        {
          name: "Hillside Cafe",
          source: "ArchDaily",
          sourceUrl: "https://www.archdaily.com/123/hillside-cafe", 
          description: "A minimalist cafe with organic forms, inspired by nature and wind.",
          keywords: ["cafe", "minimalism", "nature"]
        },
        {
          name: "Forest Retreat",
          source: "Dezeen",
          sourceUrl: "https://www.dezeen.com/2023/05/10/forest-retreat-korea-architecture/",
          description: "A meditation space in a deep forest, prioritizing harmony with nature.",
          keywords: ["meditation", "nature", "forest", "retreat"]
        },
        {
          name: "The Courtyard House",
          source: "Architizer",
          sourceUrl: "https://architizer.com/projects/the-courtyard-house/",
          description: "A modern reinterpretation of a traditional house with a serene atmosphere.",
          keywords: ["traditional", "modern", "courtyard", "house"]
        },
        {
          name: "Waveon",
          source: "Contemporist",
          sourceUrl: "https://www.contemporist.com/waveon-a-new-cafe-in-south-korea/",
          description: "A large cafe with an exposed concrete structure that visualizes the dynamic waves of the sea.",
          keywords: ["cafe", "sea", "concrete", "ocean-view"]
        }
      ]);
    }
);


// Main function to be called from the frontend
export async function discoverWebProjects(input: WebDiscoveryInput): Promise<WebDiscoveryOutput> {
  return await webDiscoveryFlow(input);
}

const webDiscoveryPrompt = ai.definePrompt({
    name: 'webDiscoveryPrompt',
    input: { schema: WebDiscoveryInputSchema },
    output: { schema: WebDiscoveryOutputSchema },
    tools: [googleSearchTool],
    prompt: `You are an expert architectural research assistant. A user is looking for inspirational projects on the web. Your task is to use the provided search tool to find them.

1.  **Execute Search:** Use the \`googleSearchTool\` with the user's query: "{{{query}}}"
2.  **Analyze Results:** The tool will provide mock search results as a JSON string. You must base your answer *only* on this data. Do not invent projects.
3.  **Select & Format:**
    *   From the tool's output, select **up to two** of the most relevant architectural projects that best match the user's query.
    *   For each project, meticulously extract its \`name\`, \`description\`, \`source\`, and \`sourceUrl\`.
    *   The \`sourceUrl\` must be a valid, complete URL copied **exactly** as provided in the tool's output. Do not modify it or append text to it.
    *   For the \`imageUrl\`, use the placeholder 'https://placehold.co/800x600.png'.
4.  **Final Output:** Structure your findings according to the required output schema. If no relevant projects are found, return an empty list.
    `,
});

const webDiscoveryFlow = ai.defineFlow(
  {
    name: 'webDiscoveryFlow',
    inputSchema: WebDiscoveryInputSchema,
    outputSchema: WebDiscoveryOutputSchema,
  },
  async (input) => {
    const { output } = await webDiscoveryPrompt(input);
    if (!output) {
        return { webProjects: [] };
    }
    console.log(`Found ${output.webProjects.length} projects from Web.`);
    console.log('Generated Web Projects:', output.webProjects);
    return output;
  }
);
