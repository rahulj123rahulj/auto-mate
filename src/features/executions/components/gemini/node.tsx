"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { GeminiDialog, GeminiFormValues } from "./dialog";
import { fetchGeminiRealtimeToken } from "./actions";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { AVAILABLE_MODELS, DEFAULT_GEMINI_MODEL } from "@/config/constants";


type GeminiNodeData = {
    variableName?: string,
    credentialId?: string
    model?: typeof AVAILABLE_MODELS[number],
    systemPrompt?: string,
    userPrompt?: string,
}

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((
    props: NodeProps<GeminiNodeType>
) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GEMINI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGeminiRealtimeToken
    });
    const nodeData = props.data as GeminiNodeData;
    const description = nodeData?.userPrompt
        ? `${nodeData.model || DEFAULT_GEMINI_MODEL} : ${nodeData.userPrompt.slice(0, 50)}...`
        : "Not configured";


    const handleOpenSettings = () => {
        setDialogOpen(true)
    }

    const handleSubmit = (values: GeminiFormValues) => {
        setNodes(currentNodes => currentNodes.map(node => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    }
                }
            }
            return node
        }));
        setDialogOpen(true)
    }

    return (
        <>
            <GeminiDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={"/logos/gemini.svg"}
                name="Gemini"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )

})

GeminiNode.displayName = "GeminiNode";
