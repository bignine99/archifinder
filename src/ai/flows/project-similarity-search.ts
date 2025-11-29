'use server';

/**
 * @fileOverview A project similarity search AI agent.
 *
 * - projectSimilaritySearch - A function that handles the project similarity search process.
 * - ProjectSimilaritySearchInput - The input type for the projectSimilaritySearch function.
 * - ProjectSimilaritySearchOutput - The return type for the projectSimilaritySearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectSimilaritySearchInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A project specification document or image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProjectSimilaritySearchInput = z.infer<typeof ProjectSimilaritySearchInputSchema>;

const ProjectSimilaritySearchOutputSchema = z.object({
  similarProjects: z
    .array(z.string())
    .describe('A list of similar project identifiers found in the database.'),
});
export type ProjectSimilaritySearchOutput = z.infer<typeof ProjectSimilaritySearchOutputSchema>;

export async function projectSimilaritySearch(
  input: ProjectSimilaritySearchInput
): Promise<ProjectSimilaritySearchOutput> {
  return projectSimilaritySearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectSimilaritySearchPrompt',
  input: {schema: ProjectSimilaritySearchInputSchema},
  output: {schema: ProjectSimilaritySearchOutputSchema},
  prompt: `You are an expert architect specializing in finding similar past projects.

You will use the project specification document or image to find similar projects in the database.

Return a list of similar project identifiers found in the database.

Project Specification: {{media url=fileDataUri}}`,
});

const projectSimilaritySearchFlow = ai.defineFlow(
  {
    name: 'projectSimilaritySearchFlow',
    inputSchema: ProjectSimilaritySearchInputSchema,
    outputSchema: ProjectSimilaritySearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
