import { Kafka } from "kafkajs"
import { createClient } from "redis"

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379"
const KAFKA_URL = process.env.KAFKA_URL ?? "localhost:9092"

const redis = createClient({ url: REDIS_URL })

// redis.on('error', (err) => console.log('Redis Client Error', err));

const kafka = new Kafka({
    clientId: "app-backend",
    brokers: [KAFKA_URL],
})

const consumer = kafka.consumer({
    groupId: "redis-consumer",
})

const get = <V extends string | number | undefined>(
    obj: object,
    key: string,
): V => {
    const value = key in obj ? obj[key as keyof object] : undefined
    return value as V
}

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

            try {
                const symbol = message.key
                const price = get<number>(data, "last")
                const change = get<number>(data, "change_pct")

                // Store the latest price and change percent for this symbol
                if (price) {
                    await redis.set(`price:${symbol}`, price)
                }

                if (change) {
                    await redis.set(`change:${symbol}`, change)
                }

                const historyKey = `history:${symbol}`
                const timestamp = Date.now()
                await redis.zAdd(historyKey, {
                    score: timestamp,
                    value: price.toString(),
                })

                // Remove prices older than 24 hours
                const cutoffTime = timestamp - 24 * 60 * 60 * 1000
                await redis.zRemRangeByScore(historyKey, 0, cutoffTime)
            } catch (err) {}
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
