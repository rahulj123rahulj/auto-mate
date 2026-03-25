import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
import { prisma } from '@/lib/db';
import { google } from '@ai-sdk/google';
import {generateText} from "ai"
import { TRPCError } from '@trpc/server';

export const appRouter = createTRPCRouter({
  testAI: protectedProcedure.mutation(async ()=>{
    throw new TRPCError({code: "BAD_REQUEST", message:"It went wrong"})
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'Write a vegetarian lasagna recipe for 4 people.',
    });

    return text;
  }),
  getWorkflows: protectedProcedure
    .query(({}) => {
      return prisma.workflow.findMany();
    }),
  createWorkflow : protectedProcedure.mutation(async ()=>{
    await inngest.send({
      name: "test/hello",
      data: {
        email: "rahul@example.com"
      }
    })
    return {success: true}
  })
});
 
// export type definition of API
export type AppRouter = typeof appRouter;