import { SubscriptionManager } from "./SubscriptionManager.ts"
import { WebSocketRouter } from "./WebSocketRouter.ts"
import { Kafka, type TopicMessages } from "kafkajs"

const KRAKEN_API_URL = "wss://ws.kraken.com/v2"
const fiatcurrency = "GBP"
const crypocurrencies = ["BTC"] // , "ETH", "SOL", "XRP", "LTC", "USDT"]

const router = new WebSocketRouter()
const subscriptions = new SubscriptionManager(router)
const socket = new WebSocket(KRAKEN_API_URL)

const kafka = new Kafka({
    clientId: "kraken-interface",
    brokers: ["localhost:9092"],
})

const producer = kafka.producer({})
producer
    .connect()
    .then(() => console.log("Kafka producer connected!"))
    .catch(console.error)
// const consumer = kafka.consumer({ groupId: "kraken-interface" })

// Executes when the connection is successfully established.
socket.addEventListener("open", (event) => {
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

router.on("heartbeat", (ws, data) => {
    // no-op
})

// cannot listen more than once...
// router.on("subscribe_response", (ws, data) => {
//     // no-op
// })

// FIXME this overwrites the handler registered in the SubscriptionManager
router.on("ticker", (ws, data) => {
    console.log(
        `Received ticker data for ${data.data.map((entry) => entry.symbol).join(", ")} at ${new Date().toISOString()}`,
    )

    // TODO organize the data better
    const batch = data.data.map(
        (entry): TopicMessages => ({
            topic: "crypto-feed",
            messages: Object.entries(entry).map(([key, value]) => ({
                key,
                value: value.toString(),
                // partition: entry.symbol,
                timestamp: Date.now().toString(),
            })),
        }),
    )

    producer.sendBatch({
        topicMessages: batch,
    })
})

router.on("error", (ws, data) => {
    console.error("Error:", data)
})
