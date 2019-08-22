const { HttpLink } = require('apollo-link-http');
const { ApolloClient } = require('apollo-client');
const {
  InMemoryCache,
  IntrospectionFragmentMatcher
} = require('apollo-cache-inmemory');
const { WebSocketLink } = require('apollo-link-ws');
const { split } = require('apollo-link');
const { getMainDefinition } = require('apollo-utilities');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const ws = require('ws');
const fetch = require('node-fetch');

const createClient = (
  httpOptions,
  subscriptionOptions,
  errorHandler,
  introspectionQueryResultData
) => {
  let link;
  const httpLink = new HttpLink({ ...httpOptions, fetch });

  if (subscriptionOptions) {
    const subClient = new SubscriptionClient(
      subscriptionOptions.uri,
      subscriptionOptions.options,
      ws
    );
    const wsLink = new WebSocketLink(subClient);

    if (errorHandler) {
      const errorLink = onError(errorHandler);

      link = ApolloLink.from([errorLink, wsLink, httpLink]);
    } else {
      link = split(
        // split based on operation type
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink
      );
    }
  } else {
    if (errorHandler) {
      const errorLink = onError(errorHandler);

      link = ApolloLink.from([errorLink, httpLink]);
    } else {
      link = httpLink;
    }
  }

  let fragmentMatcher;
  if (introspectionQueryResultData)
    fragmentMatcher = new IntrospectionFragmentMatcher(
      introspectionQueryResultData
        ? {
            introspectionQueryResultData
          }
        : {}
    );

  const client = new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same host
    link,
    cache: new InMemoryCache(introspectionQueryResultData?{ fragmentMatcher }:null)
  });

  return client;
};

module.exports = createClient;
