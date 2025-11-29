
'use server';

/**
 * @fileOverview Extracts key design concepts from project documents using AI
 * and conceptually updates a database with these concepts.
 *
 * - extractDesignConcepts - A function that extracts design concepts from a document.
 * - ExtractDesignConceptsInput - The input type for the extractDesignConcepts function.
 * - ExtractDesignConceptsOutput - The return type for the extractDesignConcepts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { upsertProjectMetadata } from '@/services/database';

const ExtractDesignConceptsInputSchema = z.object({
  projectId: z.string().describe('The unique identifier for the project.'),
  documentDataUri: z
    .string()
    .describe(
      "A project document (e.g., PDF, image) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDesignConceptsInput = z.infer<typeof ExtractDesignConceptsInputSchema>;

const ExtractDesignConceptsOutputSchema = z.object({
  designConcepts: z
    .array(z.string())
    .describe('A list of key design concepts extracted from the document.'),
});
export type ExtractDesignConceptsOutput = z.infer<typeof ExtractDesignConceptsOutputSchema>;

export async function extractDesignConcepts(
  input: ExtractDesignConceptsInput
): Promise<ExtractDesignConceptsOutput> {
  const result = await extractDesignConceptsFlow(input);
  
  if (result.designConcepts && result.designConcepts.length > 0) {
    try {
      await upsertProjectMetadata(input.projectId, {
        designConcepts: result.designConcepts,
      });
      console.log(`Successfully updated design concepts for project ${input.projectId}`);
    } catch (error) {
      console.error(`Failed to update design concepts for project ${input.projectId}:`, error);
      // Let the caller handle UI feedback for the error
      throw new Error(`Failed to update database for project ${input.projectId}.`);
    }
  }
  
  return result;
}

const prompt = ai.definePrompt({
  name: 'extractDesignConceptsPrompt',
  input: {schema: ExtractDesignConceptsInputSchema.pick({ documentDataUri: true })},
  output: {schema: ExtractDesignConceptsOutputSchema},
  prompt: `You are an AI assistant that extracts key design concepts from architectural project documents.

  Analyze the provided document and identify the main design ideas, principles, and features.
  Provide a list of 2-5 clear, concise design concepts in Korean. For example: "미니멀리즘", "자연과의 조화", "곡선 디자인".
  Return an empty list if no specific concepts are identifiable.

  Document: {{media url=documentDataUri}}
  `,
});

const extractDesignConceptsFlow = ai.defineFlow(
  {
    name: 'extractDesignConceptsFlow',
    inputSchema: ExtractDesignConceptsInputSchema,
    outputSchema: ExtractDesignConceptsOutputSchema,
  },
  async (input) => {
    // Pass only the documentDataUri to the prompt
    const {output} = await prompt({ documentDataUri: input.documentDataUri });
    return output!; // output can be null if the model fails to generate valid JSON according to the schema
  }
);
