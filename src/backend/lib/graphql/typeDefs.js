const { gql } = require('apollo-server-hapi');

module.exports = gql`
    # comments in graphql

    # this is Book type
    type Book {
        title: String!
        author: String!
    }

    # the Query type is the root of all queries
    type Query {
        books: [Book]
        getBooks(title: String!): [Book]
    }

    # the Mutation type is the root of all mutations
    type Mutation {
        addBook(title: String!, author: String!): Book
    }

    # the Subscription type is the root of all subscriptions
    type Subscription {
        bookAdded: Book
    }
`;
