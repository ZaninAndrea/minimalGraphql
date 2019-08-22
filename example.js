const createClient = require('./index');
const gql = require('graphql-tag');

const bearer = process.argv[2]

const client = createClient(
  {
    uri: 'http://bering.igloo.ooo/graphql',
    headers: {
      Authorization: 'Bearer ' + bearer
    }
  },
  {
    uri: `ws://bering.igloo.ooo/subscriptions`,
    options: {
      reconnect: true,
      connectionParams: {
        Authorization: 'Bearer ' + bearer
      }
    }
  },
  null,
  require('./fragmentTypes')
);

client
  .query({
    query: gql`
      {
        user {
          email
        }
      }
    `
  })
  .then((res) => console.log(JSON.stringify(res.data, null, 2)));

client
  .mutate({
    mutation: gql`
      mutation LogIn($email: String!, $password: String!) {
        logIn(email: $email, password: $password) {
          token
        }
      }
    `,
    variables: {
      email: '99.zanin@gmail.com',
      password: 'password'
    }
  })
  .then((res) => console.log(JSON.stringify(res.data, null, 2)));

client
  .subscribe({
    query: gql`
      subscription {
        thingCreated {
          id
          name
        }
      }
    `
  })
  .subscribe({
    next: console.log,
    err: console.log
  });
