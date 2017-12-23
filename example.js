const createClient = require("./index")
const gql = require("graphql-tag")

const bearer =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE1MTQ2NDAyNTEsInVzZXJJZCI6IjBiMGEwNDZjLWE2ZjAtNDUxMC05MTRjLTUxM2Y4YzUxMDU5NiJ9.osk32koebLZ12Pf7gvOKmVb00JACs_eyw7hok4a1ky54ZJA7Es40G2qF_kAmnjOySEWtQA1U4geoeDGofOLSWg"

const client = createClient(
    {
        uri: "http://localhost:3000/graphql",
        headers: {
            Authorization: "Bearer " + bearer,
        },
    },
    {
        uri: `ws://localhost:3000/subscriptions`,
        options: {
            reconnect: true,
            connectionParams: {
                Authorization: "Bearer " + bearer,
            },
        },
    }
)

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
    .then(res => console.log(JSON.stringify(res.data, null, 2)))

client
    .mutate({
        mutation: gql`
            mutation AuthenticateUser($email: String!, $password: String!) {
                AuthenticateUser(email: $email, password: $password) {
                    token
                }
            }
        `,
        variables: {
            email: "99.zanin@gmail.com",
            password: "password",
        },
    })
    .then(res => console.log(JSON.stringify(res.data, null, 2)))

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
