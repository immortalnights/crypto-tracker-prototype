import { Kafka } from "kafkajs"

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

    await consumer.subscribe({ topic: "crypto-feed", fromBeginning: false })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(topic, partition, `${message.key}#${message.value}`)
        },
    })
}

run()
;["SIGTERM", "SIGINT", "SIGUSR2"].forEach((type) => {
    process.once(type, async () => {
        try {
            await consumer.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
