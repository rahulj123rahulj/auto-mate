"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { AVAILABLE_ANTHROPIC_MODELS, DEFAULT_ANTHROPIC_MODEL } from "@/config/constants";
import { fetchAnthropicRealtimeToken } from "./actions";
import { AnthhropicDialog, AnthropicFormValues } from "./dialog";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";

type AnthropicNodeData = {
    variableName?: string,
    model?: typeof AVAILABLE_ANTHROPIC_MODELS[number],
    systemPrompt?: string,
    userPrompt?: string,
}

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((
    props: NodeProps<AnthropicNodeType>
) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: ANTHROPIC_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchAnthropicRealtimeToken
    });
    const nodeData = props.data as AnthropicNodeData;
    const description = nodeData?.userPrompt
        ? `${nodeData.model || DEFAULT_ANTHROPIC_MODEL} : ${nodeData.userPrompt.slice(0, 50)}...`
        : "Not configured";


    const handleOpenSettings = () => {
        setDialogOpen(true)
    }

    const handleSubmit = (values: AnthropicFormValues) => {
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
            <AnthhropicDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={"/logos/anthropic.svg"}
                name="Anthropic"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )

})

AnthropicNode.displayName = "AnthropicNode";
