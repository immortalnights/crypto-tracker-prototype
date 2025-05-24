import { Kafka } from "kafkajs"

const url = process.env.KAFKA_URL

const kafka = new Kafka({
    clientId: "my-app",
    brokers: [url],
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: "test-group" })

const run = async () => {
    await producer.connect()
    await consumer.connect()

    // Producer sending messages
    await producer.send({
        topic: "test-topic",
        messages: [{ value: "Hello KafkaJS" }],
    })

    // Consumer processing messages
    await consumer.subscribe({ topic: "test-topic", fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message?.value.toString(),
            })
        },
    })
}

run().catch(console.error)
