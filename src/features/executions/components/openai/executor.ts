import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { createOpenAI  } from "@ai-sdk/openai"
import { generateText } from "ai";
import { openAIChannel } from "@/inngest/channels/openai";
import { DEFAULT_OPENAI_MODEL } from "@/config/constants";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type OpenAIData = {
    variableName?: string
    model?: string
    systemPrompt?: string
    userPrompt?: string
}

export const OpenAIExecutor: NodeExecutor<OpenAIData> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        openAIChannel().status({
            nodeId,
            status: "loading"
        })
    )

    if (!data.variableName) {
        await publish(
            openAIChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("OpenAI node: No variable name configured");
    }

    if (!data.userPrompt) {
        await publish(
            openAIChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("OpenAI node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant.";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    // TODO: Fetch credentials that user selected

    const credentialValue = process.env.OPENAI_API_KEY!;

    const openai = createOpenAI({
        apiKey: credentialValue
    })

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai(DEFAULT_OPENAI_MODEL),
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
            openAIChannel().status({
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
            openAIChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw error;
    }

};