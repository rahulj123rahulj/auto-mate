import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecuter } from "@/features/executions/lib/executer-registry";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

export const executeWorkflow = inngest.createFunction(
    { id: "execute-workflow"},
    { 
        event: "workflows/execute.workflow",
        channels: [
            httpRequestChannel(),
            manualTriggerChannel()
        ]
    },
    async ({ event, publish, step }) => {
        const { workflowId } = event.data.workflowId;
        if(!workflowId){
            throw new NonRetriableError("Workflow ID is missing");
        }
        
        const sortedNodes  = await step.run("prepare-workflow", async () =>{
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: {
                    id: workflowId
                },
                include: {
                    nodes: true,
                    connections: true
                }
            });

            return topologicalSort(workflow.nodes, workflow.connections);
        })

        // Initialize the context with any inital data from the trigger
        let context  = event.data.initialData || {};


        // Execute each node
        for( const node of sortedNodes){
            const executor = getExecuter(node.type as NodeType)
            context  = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                step,
                publish
            })
        }

        return { workflowId, result: context };
    }
)  