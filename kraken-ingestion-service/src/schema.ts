import { z } from "zod"

export const systemSchema = z.union([
    z.literal("online"),
    z.literal("maintenance"),
    z.literal("cancel_only"),
    z.literal("post_only"),
])

export type SystemStatus = z.infer<typeof systemSchema>

export const triggerSchema = z.union([z.literal("bbo"), z.literal("trades")])

export type Trigger = z.infer<typeof triggerSchema>

export const messageSchemas = {
    status: z.object({
        channel: z.literal("status"),
        data: z.array(
            z.object({
                connection_id: z.number(),
                api_version: z.literal("v2"),
                system: systemSchema,
                version: z.string(),
            }),
        ),
        type: z.literal("update"),
    }),
    heartbeat: z.object({
        channel: z.literal("heartbeat"),
    }),
    subscribe_response: z.object({
        method: z.literal("subscribe"),
        result: z.object({
            channel: z.literal("ticker"),
            event_trigger: triggerSchema,
            snapshot: z.boolean(),
            symbol: z.string(),
            warnings: z.array(z.string()).optional(),
        }),
        success: z.boolean(),
        // If success is false
        error: z.string().optional(),
        time_in: z.string(),
        time_out: z.string(),
        req_id: z.number().optional(),
    }),
    unsubscribe_response: z.object({
        method: z.literal("unsubscribe"),
        result: z.object({
            channel: z.literal("ticker"),
            symbol: z.string(),
            event_trigger: triggerSchema,
        }),
        success: z.boolean(),
        // If success is false
        error: z.string().optional(),
        time_in: z.string(),
        time_out: z.string(),
        req_id: z.number().optional(),
    }),
    ticker: z.object({
        channel: z.literal("ticker"),
        type: z.union([z.literal("snapshot"), z.literal("update")]),
        data: z.array(
            z.object({
                symbol: z.string(),
                bid: z.number(),
                bid_qty: z.number(),
                ask: z.number(),
                ask_qty: z.number(),
                last: z.number(),
                volume: z.number(),
                vwap: z.number(),
                low: z.number(),
                high: z.number(),
                change: z.number(),
                change_pct: z.number(),
            }),
        ),
    }),
    error: z.object({
        error: z.string(),
        method: z.union([z.literal("error"), z.literal("subscribe")]),
        // If subscription error
        symbol: z.string().optional(),
        success: z.boolean(),
        time_in: z.string(),
        time_out: z.string(),
    }),
}

export type MessageType = keyof typeof messageSchemas
export type Message = { type: MessageType } & Record<string, unknown>

export type SubscribeMessage = {
    method: "subscribe"
    params: {
        channel: "ticker"
        symbol: string[]
        event_trigger: Trigger
        snapshot: boolean
    }
    req_id?: number
}

export type UnsubscribeMessage = {
    method: "unsubscribe"
    params: {
        channel: "ticker"
        symbol: string[]
        event_trigger: Trigger
    }
    req_id?: number
}
