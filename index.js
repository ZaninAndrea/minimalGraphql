const {HttpLink} = require("apollo-link-http")
const {ApolloClient} = require("apollo-client")
const {InMemoryCache} = require("apollo-cache-inmemory")
const {WebSocketLink} = require("apollo-link-ws")
const {split} = require("apollo-link")
const {getMainDefinition} = require("apollo-utilities")
const {SubscriptionClient} = require("subscriptions-transport-ws")
const ws = require("ws")
const fetch = require("node-fetch")

const createClient = (httpOptions, subscriptionOptions) => {
    let link
    const httpLink = new HttpLink({...httpOptions, fetch})

    if (subscriptionOptions) {
        const subClient = new SubscriptionClient(
            subscriptionOptions.uri,
            subscriptionOptions.options,
            ws
        )
        const wsLink = new WebSocketLink(subClient)

        link = split(
            // split based on operation type
            ({query}) => {
                const {kind, operation} = getMainDefinition(query)
                return (
                    kind === "OperationDefinition" &&
                    operation === "subscription"
                )
            },
            wsLink,
            httpLink
        )
    } else {
        link = httpLink
    }

    const client = new ApolloClient({
        // By default, this client will send queries to the
        //  `/graphql` endpoint on the same host
        link,
        cache: new InMemoryCache(),
    })

    return client
}

module.exports = createClient
