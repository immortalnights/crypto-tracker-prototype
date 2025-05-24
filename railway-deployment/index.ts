import { GraphQLClient } from "graphql-request"
import {
    createKafkaService,
    createRedisService,
    createService,
    deleteService,
    deployService,
} from "./collections/services.ts"
import { getProject } from "./collections/project.ts"

const RAILWAY_API_URL = "https://backboard.railway.app/graphql/v2"

const unwrapEdge = <T>(edges?: { node: T }[]): T[] =>
    edges?.map((edge) => edge.node) ?? []

const client = new GraphQLClient(RAILWAY_API_URL, {
    headers: {
        authorization: `Bearer ${process.env.RAILWAY_API_KEY}`,
    },
})

async function removeAllServices(projectId: string) {
    const response = await getProject(client, projectId)
    console.log(`Project ${response.project.name}`)

    const productionEnv = unwrapEdge(response.project.environments.edges).find(
        (env) => env.name === "production",
    )

    if (productionEnv) {
        const services = unwrapEdge(productionEnv?.serviceInstances.edges)
        const volumes = unwrapEdge(productionEnv?.volumeInstances.edges)

        const req = services.map((service) =>
            deleteService(
                client,
                service,
                volumes.filter(
                    (volume) => volume.serviceId === service.serviceId,
                ),
            ),
        )
        await Promise.all(req)
    } else {
        console.error("No production environment found")
    }
}

async function run() {
    const projectId = process.env.RAILWAY_PROJECT_ID!

    // Create all the services, no checks if the services already exist
    // for development only...
    console.log("Removing all services...")
    await removeAllServices(projectId)

    const redisService = await createRedisService(client, projectId, "redis")
    const kafkaService = await createKafkaService(client, projectId, "kafka")
    console.log("Creating Kraken Ingestion Service service...")
    const krakenService = await createService(
        client,
        projectId,
        "kraken-ingestion-service",
        "/kraken-ingestion-service",
        { KAFKA_URL: "${{kafka.KAFKA_URL}}" },
    )
    const redisConsumerService = await createService(
        client,
        projectId,
        "redis-consumer",
        "/redis-consumer",
        {
            KAFKA_URL: "${{kafka.KAFKA_URL}}",
            REDIS_URL: "${{redis.REDIS_URL}}",
        },
    )
    const apiService = await createService(
        client,
        projectId,
        "api-service",
        "/api-service",
        {
            REDIS_URL: "${{redis.REDIS_URL}}",
            API_URL: "${{RAILWAY_PRIVATE_DOMAIN}}",
        },
    )
    const appService = await createService(
        client,
        projectId,
        "frontend",
        "/react-native-app",
        {
            API_URL: "${{api-service.API_URL}}",
        },
    )

    const response = await getProject(client, projectId)
    const productionEnv = unwrapEdge(response.project.environments.edges).find(
        (env) => env.name === "production",
    )

    if (productionEnv) {
        await deployService(
            client,
            {
                id: "",
                serviceId: krakenService.serviceCreate.id!,
                serviceName: krakenService.serviceCreate.name,
            },
            productionEnv.id,
        )
        await deployService(
            client,
            {
                id: "",
                serviceId: redisConsumerService.serviceCreate.id!,
                serviceName: redisConsumerService.serviceCreate.name,
            },
            productionEnv.id,
        )
        await deployService(
            client,
            {
                id: "",
                serviceId: apiService.serviceCreate.id!,
                serviceName: apiService.serviceCreate.name,
            },
            productionEnv.id,
        )
        await deployService(
            client,
            {
                id: "",
                serviceId: appService.serviceCreate.id!,
                serviceName: appService.serviceCreate.name,
            },
            productionEnv.id,
        )
    }
}

run().catch((error) => {
    console.error(error)
    console.error(error?.response.errors)
})
