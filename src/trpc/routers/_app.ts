import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
import { prisma } from '@/lib/db';
 
export const appRouter = createTRPCRouter({
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