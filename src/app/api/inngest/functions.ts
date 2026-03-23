import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";

export const helloWorld = inngest.createFunction(
    { 
        id: "hello-world",
        triggers : [
            { event: "test/hello.world" },
        ]
    },
    async ({event, step}) =>{
        await step.sleep("wait-a-moment", "5s")
        await step.sleep("wait-a-moment", "5s")
        await step.sleep("wait-a-moment", "5s")
        await step.run("create-workflow", () =>{
            return prisma.workflow.create({
                data: {
                    name: event.data.name
                }
            })
        })
    }
)