import { gql } from "graphql-request"

const environmentsQuery = gql`
    query environments(
        $after: String
        $before: String
        $first: Int
        $isEphemeral: Boolean
        $last: Int
        $projectId: String!
    ) {
        environments(projectId: "") {
            __typename
            id
            name
            createdAt
            updatedAt
            edges {
                node {
                    volumeInstances {
                        edges {
                            node {
                                id
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
`
