import { gql, GraphQLClient } from "graphql-request"
import type { GraphQLEdge } from "../types.ts"
import type { ServiceInstance } from "./services.ts"
import type { VolumeInstance } from "./volumes.ts"

export interface Environment {
    id: string
    name: string
    serviceInstances: GraphQLEdge<ServiceInstance>
    volumeInstances: GraphQLEdge<VolumeInstance>
}

export interface Project {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    environments: GraphQLEdge<Environment>
}

export interface ProjectResponse {
    project: Project
}

const projectWithEnvironmentsQuery = gql`
    query project($id: String!) {
        project(id: $id) {
            createdAt
            deletedAt
            id
            name
            environments {
                edges {
                    node {
                        id
                        name
                        createdAt
                        updatedAt
                        volumeInstances {
                            edges {
                                node {
                                    id
                                    serviceId
                                    environmentId
                                    volume {
                                        name
                                        id
                                        createdAt
                                    }
                                }
                            }
                        }
                        serviceInstances {
                            edges {
                                node {
                                    id
                                    serviceId
                                    serviceName
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`

export async function getProject(client: GraphQLClient, id: string) {
    console.log(`Loading project ${id}...`)
    return client.request<ProjectResponse>(projectWithEnvironmentsQuery, {
        id,
    })
}
