import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai";
import { AVAILABLE_MODELS, DEFAULT_GEMINI_MODEL } from "@/config/constants";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type GeminiData = {
    variableName?: string
    credentialId?: string
    model?: string
    systemPrompt?: string
    userPrompt?: string
}

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
    data,
    nodeId,
    context,
    step,
    userId,
    publish
}) => {

    await publish(
        geminiChannel().status({
            nodeId,
            status: "loading"
        })
    )
    
    if (!data.variableName) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Gemini node: No variable name configured");
    }

    if (!data.credentialId) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Gemini node: Credential is required");
    }

    if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Gemini node: User prompt is missing");
    }

    const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant.";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    // TODO: Fetch credentials that user selected

    const credential = await step.run("get-credential", async () =>{
        return prisma.credential.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId
            }
        })
    });

    if(!credential) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("Gemini node: Credential not found");
    }
    const credentialValue = decrypt(credential.value);

    const google = createGoogleGenerativeAI({
        apiKey: credentialValue
    })

    try {
        const { steps } = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google(data.model || DEFAULT_GEMINI_MODEL),
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
            geminiChannel().status({
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
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw error;
    }

};