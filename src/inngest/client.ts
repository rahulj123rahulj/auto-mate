import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";


export const inngest = new Inngest({
    id: "auto-mate", 
    middleware: [realtimeMiddleware()],
});