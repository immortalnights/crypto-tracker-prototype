import { gql, GraphQLClient } from "graphql-request"
import { volumeCreate, volumeDelete, type VolumeInstance } from "./volumes.ts"

export interface ServiceInstance {
    id: string
    serviceId: string
    serviceName: string
}

export interface ServiceCreateResponse {
    serviceCreate: {
        createdAt: string
        deletedAt: string
        id: string
        name: string
        projectId: string
        updatedAt: string
    }
}

const serviceCreateMutation = gql`
    mutation serviceCreate($input: ServiceCreateInput!) {
        serviceCreate(input: $input) {
            createdAt
            deletedAt
            # deployments
            featureFlags
            icon
            id
            name
            # project
            projectId
            # repoTriggers
            # serviceInstances
            templateServiceId
            templateThreadSlug
            updatedAt
        }
    }
`

const serviceDeleteMutation = gql`
    mutation serviceDelete($environmentId: String, $id: String!) {
        serviceDelete(environmentId: $environmentId, id: $id)
    }
`

const serviceInstanceUpdateMutation = gql`
    mutation serviceInstanceUpdate(
        $environmentId: String
        $input: ServiceInstanceUpdateInput!
        $serviceId: String!
    ) {
        serviceInstanceUpdate(
            environmentId: $environmentId
            input: $input
            serviceId: $serviceId
        )
    }
`

export async function createDockerService(
    client: GraphQLClient,
    projectId: string,
    name: string,
    image: string,
    variables: object | null = null,
) {
    console.log(`Creating Docker service '${name}'...`)
    return client.request<ServiceCreateResponse>(serviceCreateMutation, {
        input: {
            name,
            projectId,
            source: {
                image,
            },
            variables,
        },
    })
}

export async function createService(
    client: GraphQLClient,
    projectId: string,
    name: string,
    rootDirectory: string,
    variables: object | null = null,
) {
    console.log(`Creating service '${name}'...`)
    const service = await client.request<ServiceCreateResponse>(
        serviceCreateMutation,
        {
            input: {
                name,
                projectId,
                source: {
                    repo: "immortalnights/crypto-tracker-prototype",
                },
                variables,
            },
        },
    )

    console.log("Setting service root directory...")
    await client.request(serviceInstanceUpdateMutation, {
        input: {
            rootDirectory,
        },
        serviceId: service.serviceCreate.id,
    })
}

export async function createRedisService(
    client: GraphQLClient,
    projectId: string,
    name: string,
) {
    console.log(`Creating Redis service '${name}'...`)
    const service = await createDockerService(
        client,
        projectId,
        name,
        "bitnami/redis:7.2.5",
        {
            REDISHOST: "redis.railway.internal",
            REDISPORT: "6379",
            REDISUSER: "default",
            REDIS_PASSWORD: "thisismypassword",
            REDISPASSWORD: "thisismypassword",
            REDIS_URL:
                "redis://default:thisismypassword@redis.railway.internal:6379",
        },
    )

    console.log("Adding Redis service volume...")
    await volumeCreate(client, projectId, service.serviceCreate.id, "/bitnami")
}

export async function createKafkaService(
    client: GraphQLClient,
    projectId: string,
    name: string,
) {
    console.log(`Creating Kafka service '${name}'...`)
    const service = await createDockerService(
        client,
        projectId,
        name,
        "bitnami/kafka:4.0.0",
        {
            KAFKA_URL: "kafka.railway.internal:9092",
            KAFKA_PORT: "9092",
            KAFKA_CFG_NODE_ID: "0",
            KAFKA_CFG_PROCESS_ROLES: "controller,broker",
            KAFKA_CFG_LISTENERS: "PLAINTEXT://:9092,CONTROLLER://:9093",
            KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP:
                "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT",
            KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: "0@kafka:9093",
            KAFKA_CFG_CONTROLLER_LISTENER_NAMES: "CONTROLLER",
            // KAFKA_ADVERTISED_LISTENERS:
            //     "PLAINTEXT://kafka.railway.internal:9092",
            // KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "PLAINTEXT:PLAINTEXT",
            // KAFKA_LISTENERS: "PLAINTEXT://
        },
    )

    console.log("Adding Kafka service volume...")
    await volumeCreate(
        client,
        projectId,
        service.serviceCreate.id,
        "/bitnami/kafka",
    )
}

export async function deleteService(
    client: GraphQLClient,
    service: ServiceInstance,
    volumes: VolumeInstance[] = [],
) {
    console.log(
        `Deleting service ${service.serviceName} (${service.serviceId})...`,
    )
    await client.request(serviceDeleteMutation, {
        environmentId: null,
        id: service.serviceId,
    })

    if (volumes.length > 0) {
        console.log(
            `Deleting ${volumes.length} volumes for service ${service.serviceName}...`,
        )
        const req = volumes.map((volume) =>
            volumeDelete(client, volume.volumeId),
        )
        await Promise.all(req)
    }
}
