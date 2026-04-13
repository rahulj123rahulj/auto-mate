import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { createAnthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { DEFAULT_ANTHROPIC_MODEL } from "@/config/constants";
import { prisma } from "@/lib/db";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type AnthropicData = {
    variableName?: string
    credentialId?: string
    model?: string
    systemPrompt?: string
    userPrompt?: string
}

export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        anthropicChannel().status({
            nodeId,
            status: "loading"
        })
    )

    if (!data.variableName) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Anthropic node: No variable name configured");
    }

    if (!data.credentialId) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Anthropic node: No credential configured");
    }

    if (!data.userPrompt) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Anthropic node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant.";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);


    const credential = await step.run("get-credential", async () => {
        return prisma.credential.findUniqueOrThrow({
            where: {
                id: data.credentialId
            }
        })
    });

    if (!credential) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Anthropic node: Credential not found");
    }
    const credentialValue = credential.value;


    const anthropic = createAnthropic({
        apiKey: credentialValue
    })

    try {
        const { steps } = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic(DEFAULT_ANTHROPIC_MODEL),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            }
        );
        const text =
            steps[0].content[0].type === "text"
                ? steps[0].content[0].text
                : "";

        await publish(
            anthropicChannel().status({
                nodeId,
                status: "success"
            })
        )

        return {
            ...context,
            [data.variableName]: {
                text
            }
        }

    } catch (error) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw error;
    }

};