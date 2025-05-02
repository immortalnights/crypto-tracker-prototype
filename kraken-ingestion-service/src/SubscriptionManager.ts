import {
    type SubscribeMessage,
    type UnsubscribeMessage,
    type Trigger,
} from "./schema.ts"
import { WebSocketRouter } from "./WebSocketRouter.ts"

export class SubscriptionManager {
    // private subscriptions: string[] = []

    constructor(router: WebSocketRouter) {
        router.on("subscribe_response", (_ws, data) => {
            // if data.success is true, record the subscription and handle the ticker messages
            if (data.success) {
                console.debug(
                    `Successfully subscribed to ${data.result.symbol} for trigger ${data.result.event_trigger}`,
                )
            }
        })

        router.on("unsubscribe_response", (_ws, data) => {
            // if data.success is true, remove the subscription
            if (data.success) {
                console.debug(
                    `Successfully unsubscribed to ${data.result.symbol} for trigger ${data.result.event_trigger}`,
                )
            }
        })

        router.on("ticker", (_ws, _data) => {
            // check subscription for symbol
        })
    }

    subscribe(
        ws: WebSocket,
        symbols: string | string[],
        trigger: Trigger = "trades",
    ) {
        const symbolArray = Array.isArray(symbols) ? symbols : [symbols]
        const msg: SubscribeMessage = {
            method: "subscribe",
            params: {
                channel: "ticker",
                symbol: symbolArray,
                event_trigger: trigger,
                snapshot: true,
            },
        }

        console.debug(
            `Subscribing to ${symbolArray.join(", ")} on trigger ${trigger}`,
        )
        ws.send(JSON.stringify(msg))
    }

    unsubscribe(
        ws: WebSocket,
        symbols: string | string[],
        trigger: Trigger = "trades",
    ) {
        const symbolArray = Array.isArray(symbols) ? symbols : [symbols]
        const msg: UnsubscribeMessage = {
            method: "unsubscribe",
            params: {
                channel: "ticker",
                symbol: symbolArray,
                event_trigger: trigger,
            },
        }

        console.debug(
            `Unsubscribing to ${symbolArray.join(", ")} on trigger ${trigger}`,
        )
        ws.send(JSON.stringify(msg))
    }
}
