import { gql, GraphQLClient } from "graphql-request"

export interface VolumeInstance {
    id: string
    volumeId: string
    volume: Volume
    createdAt: string
    environmentId: string
    serviceId: string
}

export interface Volume {
    id: string
    name: string
}

const volumeCreateMutation = gql`
    mutation volumeCreate($input: VolumeCreateInput!) {
        volumeCreate(input: $input) {
            createdAt
            id
            name
            # project
            projectId
            # volumeInstances
        }
    }
`

const volumeDeleteMutation = gql`
    mutation volumeDelete($volumeId: String!) {
        volumeDelete(volumeId: $volumeId)
    }
`

export async function volumeCreate(
    client: GraphQLClient,
    projectId: string,
    serviceId: string,
    mountPath: string,
) {
    return client.request(volumeCreateMutation, {
        input: {
            projectId,
            serviceId: serviceId,
            mountPath,
        },
    })
}

export async function volumeDelete(client: GraphQLClient, volumeId: string) {
    console.log(`Deleting volume ${volumeId}...`)
    return client.request(volumeDeleteMutation, {
        volumeId,
    })
}
