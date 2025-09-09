'use server';

/**
 * @fileOverview An AI agent for determining if and when to display near real time status updates to a client via a tracking link, for security reasons.
 *
 * - getPodStatus - A function that handles the process of retrieving and sanitizing the pod status for public display.
 * - GetPodStatusInput - The input type for the getPodStatus function.
 * - GetPodStatusOutput - The return type for the getPodStatus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPodStatusInputSchema = z.object({
  publicToken: z
    .string()
    .describe('The public token associated with the POD.'),
});
export type GetPodStatusInput = z.infer<typeof GetPodStatusInputSchema>;

const GetPodStatusOutputSchema = z.object({
  displayStatus: z
    .boolean()
    .describe(
      'Whether or not to display the status to the client based on security considerations.'
    ),
  status: z.string().optional().describe('The sanitized status of the POD.'),
  timestamps: z
    .record(z.string(), z.string())
    .optional()
    .describe('Timestamps relevant to the POD, formatted for display.'),
  geotagMapLink: z.string().optional().describe('A link to a map showing the geotag of the delivery.'),
});

export type GetPodStatusOutput = z.infer<typeof GetPodStatusOutputSchema>;

export async function getPodStatus(input: GetPodStatusInput): Promise<GetPodStatusOutput> {
  return getPodStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPodStatusPrompt',
  input: {schema: GetPodStatusInputSchema},
  output: {schema: GetPodStatusOutputSchema},
  prompt: `You are an AI assistant that determines whether to display POD status information to a client based on security.

  Given the public token: {{{publicToken}}}

  Determine if the POD status should be displayed to the client.

  Considerations:
  - Delay displaying the status until the POD is out for delivery to prevent potential misuse of information.
  - If the POD is delivered, display the delivery status, timestamps, and geotag map link.
  - If the POD is not yet out for delivery, do not display any status information.
  - Return a boolean value for displayStatus, and include status, timestamps, and geotagMapLink only if displayStatus is true.
  `,
});

const getPodStatusFlow = ai.defineFlow(
  {
    name: 'getPodStatusFlow',
    inputSchema: GetPodStatusInputSchema,
    outputSchema: GetPodStatusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
