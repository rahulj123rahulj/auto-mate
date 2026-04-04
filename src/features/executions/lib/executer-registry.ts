import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";

export const executerRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER] : manualTriggerExecutor,
    [NodeType.INITIAL] : manualTriggerExecutor,
    [NodeType.HTTP_REQUEST] : httpRequestExecutor
};


export const getExecuter = (type: NodeType): NodeExecutor => {
    const executor = executerRegistry[type];
    if(!executor) {
        throw new Error(`No executer found for node type ${type}`);
    }
    return executor;  
};   