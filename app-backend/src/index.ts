import express from "express"
import { Kafka } from "kafkajs"

const kafka = new Kafka({
    clientId: "app-backend",
    brokers: ["localhost:9092"],
})

const app = express()
const port = 8081

const consumer = kafka.consumer({
    groupId: "app-consumer",
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

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

app.get("/", (req, res) => {})

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
