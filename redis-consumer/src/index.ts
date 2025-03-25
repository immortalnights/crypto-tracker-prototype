import { Kafka } from "kafkajs"
import { createClient } from "redis"

const redis = createClient()

// redis.on('error', (err) => console.log('Redis Client Error', err));

const kafka = new Kafka({
    clientId: "app-backend",
    brokers: ["localhost:9092"],
})

const consumer = kafka.consumer({
    groupId: "redis-consumer",
})

const run = async () => {
    await consumer
        .connect()
        .then(() => console.log("Kafka consumer connected!"))
        .catch(console.error)

    await redis.connect()

    await consumer.subscribe({ topic: "crypto-feed", fromBeginning: false })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(topic, partition, `${message.key}#${message.value}`)
            const data = JSON.parse(message.value?.toString() ?? "") as object

            const symbol = message.key
            if ("last" in data && typeof data.last === "number") {
                const price = data.last
                // Store the latest price for this symbol
                await redis.set(`price:${symbol}`, price)

                const historyKey = `history:${symbol}`
                const timestamp = Date.now()
                await redis.zAdd(historyKey, {
                    score: timestamp,
                    value: price.toString(),
                })

                // Remove prices older than 24 hours
                const cutoffTime = timestamp - 24 * 60 * 60 * 1000
                await redis.zRemRangeByScore(historyKey, 0, cutoffTime)
            }
        },
    })
}

run()
;["SIGTERM", "SIGINT", "SIGUSR2"].forEach((type) => {
    process.once(type, async () => {
        try {
            await consumer.disconnect()
            await redis.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
