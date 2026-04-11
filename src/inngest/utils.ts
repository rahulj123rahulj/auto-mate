import { Connection, Node } from "@/generated/prisma/client";
import toposort from "toposort";
import { inngest } from "./client";


export const topologicalSort = (
    nodes: Node[],
    connections: Connection[],
): Node[] => {
    if ( connections.length === 0 ) {
        return nodes;
    }

    // Create Edges array for toposort
    const edges: [string, string][] = connections.map((conn) => [
        conn.fromNodeId,
        conn.toNodeId,
    ]);

    //  Add nodes with no connections as self-edges to ensure they're included
    const connectedNodeIds = new Set<string>();
    for( const conn of connections ){
        connectedNodeIds.add(conn.fromNodeId);
        connectedNodeIds.add(conn.toNodeId);
    }

    for(const node of nodes){
        if(!connectedNodeIds.has(node.id)){
            edges.push([node.id, node.id]);
        }
    }

    // Perform topological sort 
    let sortedNodeIds: string[];
    try {
        sortedNodeIds = toposort(edges);
        // Remove duplicates (from self-edges)
        sortedNodeIds = Array.from(new Set(sortedNodeIds));
    } catch (e) {
        if(e instanceof Error && e.message.includes("Cyclic")) {
            throw new Error("Workflow contains a cycle");
        }
        throw e;
    }

    // Map sorted Ids back to node objects
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    return sortedNodeIds.map((id) => nodeMap.get(id) as Node).filter(Boolean);
}

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
  });
};