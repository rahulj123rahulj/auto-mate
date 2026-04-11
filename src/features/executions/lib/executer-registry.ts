import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { StripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";

export const executerRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER] : manualTriggerExecutor,
    [NodeType.INITIAL] : manualTriggerExecutor,
    [NodeType.HTTP_REQUEST] : httpRequestExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER] : googleFormTriggerExecutor,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerExecutor
};


export const getExecuter = (type: NodeType): NodeExecutor => {
    const executor = executerRegistry[type];
    if(!executor) {
        throw new Error(`No executer found for node type ${type}`);
    }
    return executor;  
};   