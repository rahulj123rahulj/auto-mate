import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "../../../inngest/utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecuter } from "@/features/executions/lib/executer-registry";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { geminiChannel } from "@/inngest/channels/gemini";
import { openAIChannel } from "@/inngest/channels/openai";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { discordChannel } from "@/inngest/channels/discord";
import { slackChannel } from "@/inngest/channels/slack";

export const executeWorkflow = inngest.createFunction(
    { 
        id: "execute-workflow",
        retries: process.env.NODE_ENV === "production" ? 3 : 0,
    },
    {
        event: "workflows/execute.workflow",
        channels: [
            httpRequestChannel(),
            manualTriggerChannel(),
            googleFormTriggerChannel(),
            stripeTriggerChannel(),
            geminiChannel(),
            openAIChannel(),
            anthropicChannel(),
            discordChannel(),
            slackChannel()
        ]
    },
    async ({ event, publish, step }) => {
        const workflowId = event.data.workflowId;
        if (!workflowId) {
            throw new NonRetriableError("Workflow ID is missing");
        }

        const sortedNodes = await step.run("prepare-workflow", async () => {
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

        const userId = await step.run("find-user-id", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: {
                    id: workflowId
                },
                select: {
                    userId: true
                }
            });

            return workflow.userId
        })

        // Initialize the context with any inital data from the trigger
        let context = event.data.initialData || {};


        // Execute each node
        for (const node of sortedNodes) {
            const executor = getExecuter(node.type as NodeType)
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                step,
                publish,
                userId
            })
        }

        return { workflowId, result: context };
    }
)  