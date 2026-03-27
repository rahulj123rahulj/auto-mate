"use client"
import type { NodeProps } from "@xyflow/react"
import { PlaceholderNode } from "./react-flow/placeholder-node"
import { memo } from "react"
import { PlusIcon } from "lucide-react"
import { WorkflowNode } from "./workflow-node"


export const InitialNode = memo((props: NodeProps) => {
    return (
        <WorkflowNode showToolbar={false} name="Initial Node" description="Click to add a node">
            <PlaceholderNode onClick={() => { }} {...props}>
                <div className="cursor-pointer flex items-center justify-center">
                    <PlusIcon className="size-4" />
                </div>
            </PlaceholderNode>
        </WorkflowNode>
    )
})

InitialNode.displayName = "InitialNode"