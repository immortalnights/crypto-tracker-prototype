import { SubscriptionManager } from "./SubscriptionManager.ts"
import { WebSocketRouter } from "./WebSocketRouter.ts"
import { Kafka, type Message } from "kafkajs"

const KRAKEN_API_URL = "wss://ws.kraken.com/v2"
const fiatcurrency = "GBP"
const crypocurrencies = ["BTC", "ETH", "SOL", "XRP", "LTC"]

const router = new WebSocketRouter()
const subscriptions = new SubscriptionManager(router)
const socket = new WebSocket(KRAKEN_API_URL)

const kafka = new Kafka({
    clientId: "kraken-interface",
    brokers: [process.env.KAFKA_URL ?? "localhost:9092"],
})

const producer = kafka.producer({})
producer
    .connect()
    .then(() => console.log("Kafka producer connected!"))
    .catch(console.error)
// const consumer = kafka.consumer({ groupId: "kraken-interface" })

// Executes when the connection is successfully established.
socket.addEventListener("open", (_event) => {
    console.log("WebSocket connection established!")
})

// Listen for messages and executes when a message is received from the server.
socket.addEventListener("message", (event) => {
    // console.debug("Message from server:", event.data)
    router.handleMessage(socket, event.data)
})

// Executes when the connection is closed, providing the close code and reason.
socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event.code, event.reason)
})

// Executes if an error occurs during the WebSocket communication.
socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error)
})

router.on("status", (ws, { data: dataArray }) => {
    const [data] = dataArray
    if (data.system === "online") {
        console.log("Kraken is online!")
        // subscribe to crypto-feed
        subscriptions.subscribe(
            ws,
            crypocurrencies.map((item) => `${item}/${fiatcurrency}`),
        )
        // subscription_message.params.symbol = crypocurrencies.map(
        //     (currency) => `${currency}${fiatcurrency}`,
    } else {
        console.log("Status:", data)
    }
})

router.on("heartbeat", (_ws, _data) => {
    // no-op
})

// cannot listen more than once...
// router.on("subscribe_response", (ws, data) => {
//     // no-op
// })

// FIXME this overwrites the handler registered in the SubscriptionManager
router.on("ticker", (_ws, data) => {
    console.log(
        `Received ticker data for ${data.data.map((entry: any) => entry.symbol).join(", ")} at ${new Date().toISOString()}`,
    )

    producer.sendBatch({
        topicMessages: [
            {
                topic: "crypto-feed",
                messages: data.data.map(
                    ({ symbol, ...rest }): Message => ({
                        key: symbol,
                        value: JSON.stringify(rest),
                    }),
                ),
            },
        ],
    })
})

router.on("error", (_ws, data) => {
    console.error("Error:", data)
})
;["SIGTERM", "SIGINT", "SIGUSR2"].forEach((type) => {
    process.once(type, async () => {
        try {
            socket.close()
            await producer.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
