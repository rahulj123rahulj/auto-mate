"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchDiscordRealtimeToken } from "./actions";
import { DiscordDialog, DiscordFormValues } from "./dialog";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";


type DiscordNodeData = {
    webhookUrl?: string;
    content?: string;
    username?: string;
}

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((
    props: NodeProps<DiscordNodeType>
) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: DISCORD_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDiscordRealtimeToken
    });
    const nodeData = props.data as DiscordNodeData;
    const description = nodeData?.content
        ? `Send ${nodeData.content.slice(0, 50)}...`
        : "Not configured";


    const handleOpenSettings = () => {
        setDialogOpen(true)
    }

    const handleSubmit = (values: DiscordFormValues) => {
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
            <DiscordDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={"/logos/discord.svg"}
                name="Discord"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )

})

DiscordNode.displayName = "DiscordNode";
