
'use server';
/**
 * @fileOverview An AI agent that discovers relevant projects from the internal database based on a natural language query and structured filters.
 * This flow acts as a clean, reliable bridge to the database service.
 *
 * - discoverProjects - Analyzes a query and finds matching projects.
 * - ProjectDiscoveryInput - Input for the discovery flow.
 * - ProjectDiscoveryOutput - Output from the discovery flow.
 */

import { z } from 'zod';
import { queryProjects } from '@/services/database';
import type { Project } from '@/types/project';
import { unstable_noStore as noStore } from 'next/cache';

const ProjectDiscoveryInputSchema = z.object({
  query: z.string().describe('A natural language query from the user describing the project they are looking for.'),
  projectType: z.string().optional().describe('A pre-selected project type filter.'),
  areaType: z.string().optional().describe('A pre-selected area type filter.'),
  totalFloorArea: z.string().optional().describe('A pre-selected total floor area range.'),
  designConcepts: z.array(z.string()).optional().describe('A list of pre-selected design concept filters.'),
});
export type ProjectDiscoveryInput = z.infer<typeof ProjectDiscoveryInputSchema>;

export type ProjectDiscoveryOutput = {
  projects: Project[];
};

/**
 * This is the final, stable version of the discovery flow.
 * It acts as a clean, reliable bridge between the user interface and the database service.
 * All complex logic, scoring, and data fetching are now handled exclusively by the `queryProjects` function.
 */
export async function discoverProjects(input: ProjectDiscoveryInput): Promise<ProjectDiscoveryOutput> {
  noStore();
  console.log('AI_FLOW: Initiating project discovery with input:', input);
  
  try {
    // Combine the user's text query and design concept checkboxes into a single list of search terms
    // It handles queries with spaces and/or commas (e.g., "모던, 카페" or "미니멀리즘 주택")
    const searchTerms = [
        ...(input.query ? input.query.trim().toLowerCase().split(/[\s,]+/).filter(Boolean) : []),
        ...(input.designConcepts || [])
    ];

    const projects = await queryProjects({
        projectType: input.projectType !== 'all' ? input.projectType : undefined,
        areaType: input.areaType !== 'all' ? input.areaType : undefined,
        totalFloorArea: input.totalFloorArea !== 'all' ? input.totalFloorArea : undefined,
        searchTerms: searchTerms.length > 0 ? searchTerms : undefined,
    });
    
    console.log(`AI_FLOW: Successfully discovered and sorted ${projects.length} projects.`);
    
    return { projects };
  } catch (error) {
    console.error("AI_FLOW: A critical error occurred during project discovery:", error);
    return { projects: [] };
  }
}
