# Graphql tester

This tester is built using the awesome [apollo library](https://www.apollographql.com/), but wires it up so that you can use it in node instead of the browser.

## Usage

### Initializing

The only libraries you will need are `graphqltester` (guess what) and `graphql-tag` (parses you graphql documents).
To create a client call the `graphqltester(httpOptions, subscriptionOptions)`

* `httpOptions`: and object with the following props:

  * `uri` (required): the uri at which your server is found. E.g.

  ```js
  {
      uri: "http://localhost:3000/graphql",
  }
  ```

  * `headers` (optional): and object containing the headers you want your request to have. E.g.

  ```js
  {
      uri: "http://localhost:3000/graphql",
      headers: {
          Authorization: "Bearer " + bearer
      }
  }
  ```

* `subscriptionOptions`(optional): if not passed you will not be able to use subscriptions. It's an object with the following props:

  * `uri` (required): the uri at which your subscription server can be found (the **websocket uri** not http one). E.g.
    ```js
    {
        uri: `ws://localhost:3000/subscriptions`
    }
    ```
  * `options`(optional): and object containing `reconnect` (optional, boolean, whether to try to reconnect) and `connectionParams` (optional, an object containing the websocket connection parameters). E.g.

  ```js
   {
       uri: `ws://localhost:3000/subscriptions`,
       options: {
           reconnect: true,
           connectionParams: {
               Authorization: "Bearer " + bearer,
           },
       },
   }
  ```

### Queries

Once you created a client you can use it's prop `query` to run a query.
The `client.query(opts)` function returns a Promise and takes an option object as input, it has this props:

* `query`: a query parsed with `graphql-tag`. E.g.

```js
const gql = require("graphql-tag")

// create the client here

client
    .query({
        query: gql`
            {
                user {
                    email
                }
            }
        `,
    })
    .then(res => console.log(res.data))
```

* `variables` (optional): containing the variables used in the graphql query. E.g.

```js
const gql = require("graphql-tag")

// create the client here

client
    .query({
        query: gql`
            query userQuery($id: ID!) {
                user(id: $id) {
                    email
                }
            }
        `,
        variables: {
            id: "myId",
        },
    })
    .then(res => console.log(res.data))
```

### Mutations

To run a mutation use the `client.mutation(opts)` function. It works as the `client.query(opts)` function, but instead of passing a `query` parameter in options you pass a `mutation` parameter
E.g.

```js
client
    .mutate({
        mutation: gql`mutation logIn($email:String, password:String){
        authenticateUser(email:$email, password:$password){
            token
        }
    }`,
        variables: {
            email: "99.zanin@gmail.com",
            password: "password",
        },
    })
    .then(res => console.log(res.data))
```

### Subscriptions

Finally you can use subscriptions through `client.subscribe(opts)`. The options are the same as for `client.query(opts)`, but instead of returning a Promise it returns a ZenObservable.  
The ZenObservable has a `observable.subscribe(handlers)` prop that allows you to handle the subscription results. The `handlers` object has to have the following props:

* `next`: the function handling successful result
* `err` (optional): the function handling errors

E.g.

```js
const gql = require("graphql-tag")

client
    .subscribe({
        query: gql`
            subscription {
                deviceCreated {
                    id
                    customName
                }
            }
        `,
    })
    .subscribe({
        next: console.log,
        err: console.log,
    })
```
