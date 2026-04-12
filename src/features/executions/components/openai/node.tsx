"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { OpenAIDialog, OpenAIFormValues } from "./dialog";
import { AVAILABLE_OPENAI_MODELS, DEFAULT_OPENAI_MODEL } from "@/config/constants";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { fetchOpenAIRealtimeToken } from "./actions";

type OpenAINodeData = {
    variableName?: string,
    model?: typeof AVAILABLE_OPENAI_MODELS[number],
    systemPrompt?: string,
    userPrompt?: string,
}

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((
    props: NodeProps<OpenAINodeType>
) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENAI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenAIRealtimeToken
    });
    const nodeData = props.data as OpenAINodeData;
    const description = nodeData?.userPrompt
        ? `${nodeData.model || DEFAULT_OPENAI_MODEL} : ${nodeData.userPrompt.slice(0, 50)}...`
        : "Not configured";


    const handleOpenSettings = () => {
        setDialogOpen(true)
    }

    const handleSubmit = (values: OpenAIFormValues) => {
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
            <OpenAIDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={"/logos/openai.svg"}
                name="Open AI"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )

})

OpenAINode.displayName = "OpenAINode";
