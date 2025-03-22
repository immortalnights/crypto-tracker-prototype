import z from "zod"
import { messageSchemas, type MessageType } from "./schema.ts"

type Handler = <T extends MessageType>(
    ws: WebSocket,
    data: z.infer<(typeof messageSchemas)[T]>,
) => void

export class WebSocketRouter {
    private handlers: Record<string, Handler> = {}

    on<T extends MessageType>(
        type: T,
        handler: (
            ws: WebSocket,
            data: z.infer<(typeof messageSchemas)[T]>,
        ) => void,
    ) {
        this.handlers[type] = handler
    }

    handleMessage(ws: WebSocket, message: string) {
        let data: object
        try {
            data = JSON.parse(message)
        } catch (error) {
            data = {}
            console.error("Failed to parse JSON", error)
        }

        let messageType: MessageType | undefined
        // Try to use the correct schema
        if ("error" in data) {
            messageType = "error"
        } else if ("channel" in data) {
            if (data.channel === "status") {
                messageType = "status"
            } else if (data.channel === "heartbeat") {
                messageType = "heartbeat"
            } else if (data.channel === "ticker") {
                messageType = "ticker"
            }
        } else if ("method" in data) {
            if (data.method === "subscribe") {
                messageType = "subscribe_response"
            } else if (data.method === "unsubscribe") {
                messageType = "unsubscribe_response"
            } else if (data.method === "error") {
                messageType = "error"
            }
        } else {
            // Otherwise, try all the schemas
            messageType = Object.keys(messageSchemas).find(
                (key): key is MessageType =>
                    messageSchemas[key as MessageType].safeParse(data).success,
            )
        }

        try {
            if (messageType) {
                const msg = messageSchemas[messageType].parse(data)
                const handler = this.handlers[messageType]
                if (handler) {
                    handler(ws, msg)
                } else {
                    console.error(`Unhandled ${messageType} message:`, data)
                }
            } else {
                console.error("Unknown message received:", data)
            }
        } catch (error) {
            console.error(
                "Failed to parse message",
                message,
                `as ${messageType}`,
                error,
            )
        }
    }
}
