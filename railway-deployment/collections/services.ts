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

const serviceConnectMutation = gql`
    mutation serviceConnect($id: String!, $input: ServiceConnectInput!) {
        serviceConnect(id: $id, input: $input)
    }
`

const serviceInstanceDeployMutation = gql`
    mutation serviceInstanceDeployV2(
        $environmentId: String!
        $serviceId: String!
    ) {
        serviceInstanceDeployV2(
            environmentId: $environmentId
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

    console.debug(
        `Created service ${service.serviceCreate.name} (${service.serviceCreate.id})`,
    )

    console.log("Setting service root directory...")
    await client.request(serviceInstanceUpdateMutation, {
        input: {
            rootDirectory,
            builder: "RAILPACK",
            restartPolicyMaxRetries: 2,
        },
        serviceId: service.serviceCreate.id,
    })

    // FIXME this failing, but I cannot identify why...
    try {
        console.log("Connecting service to github...")
        await client.request(serviceConnectMutation, {
            id: service.serviceCreate.id,
            input: {
                repo: "immortalnights/crypto-tracker-prototype",
                branch: "main",
            },
        })
    } catch (err) {
        console.error("Failed to connect service to GitHub:", err)
    }

    return service
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
            REDISHOST: "${{RAILWAY_PRIVATE_DOMAIN}}",
            REDISPORT: "6379",
            REDISUSER: "default",
            REDIS_PASSWORD: "thisismypassword",
            REDISPASSWORD: "${{REDIS_PASSWORD}}",
            REDIS_URL:
                "redis://default:${{REDISPASSWORD}}@${{REDISHOST}}:${{REDISPORT}}",
        },
    )

    console.log("Adding Redis service volume...")
    await volumeCreate(client, projectId, service.serviceCreate.id, "/bitnami")

    return service
}

export async function createKafkaService(
    client: GraphQLClient,
    projectId: string,
    name: string,
) {
    console.log(`Creating Kafka service '${name}'...`)
    const port = "9092"
    const service = await createDockerService(
        client,
        projectId,
        name,
        "bitnami/kafka:4.0.0",
        {
            KAFKA_URL: `\${{RAILWAY_PRIVATE_DOMAIN}}:${port}`,
            KAFKA_PORT: port,
            KAFKA_CFG_ADVERTISED_LISTENERS: "PLAINTEXT://${{KAFKA_URL}}",
            KAFKA_CFG_NODE_ID: "1",
            KAFKA_CFG_PROCESS_ROLES: "controller,broker",
            KAFKA_CFG_LISTENERS: `PLAINTEXT://:${port},CONTROLLER://:9093`,
            KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP:
                "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT",
            KAFKA_CFG_CONTROLLER_QUORUM_VOTERS:
                "1@${{RAILWAY_PRIVATE_DOMAIN}}:9093",
            KAFKA_CFG_CONTROLLER_LISTENER_NAMES: "CONTROLLER",
        },
    )

    return service
}

export async function deployService(
    client: GraphQLClient,
    service: ServiceInstance,
    environmentId: string,
) {
    console.log(
        `Deploying service ${service.serviceName} (${service.serviceId})...`,
    )
    return client.request(serviceInstanceDeployMutation, {
        environmentId,
        serviceId: service.serviceId,
    })
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
