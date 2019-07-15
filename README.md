# GraphQL Basics

The repository covers all the basic needs to get GraphQL setup for both server side (hapi.js) and client side.

### Dependencies

The following are the dependencies needed to have the client-side working smoothly. They can all be installed via `npm install <dependency_name>`.

- apollo-client
- apollo-link
- apollo-link-http
- apollo-link-ws
- apollo-utilities
- subscriptions-transport-ws
- graphql-tag

Also, webpack is used to help with bundling of the client side javascript code. It should be noted the loaders are essential to having webpack work as intended. The webpack config is as follows:

For the server-side of the implementation the dependencies are as follows:

- @hapi/hapi
- @hapi/inert
- apollo-server-hapi

The `package.json` file can always be checked to confirm working versions and any updates.

## Server

Hapi.js version 18 is the web framework behind this project. Its fast, clean and easy to understand. The core data model is a book as can be seen in the library. Since data persistence is not of concern in this project, hardcoded copies are used. This is just for study purposes and so I cannot guarantee the correctness of the relationship between a book and an author.

```
const books = [
    {
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling',
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
    },
];
```

The first step to having a working GraphQL server is to create a `schema`(type definitions) and their respective `resolvers`. We also have `subscriptions` covered to ensure completeness. The schema (type definitions) is as follows.

```
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
```

Their respective resolvers are as follows:

```
Subscription: {
    bookAdded: {
        subscribe: (_, __, { pubSub }) => {
            return pubSub.asyncIterator([BOOK_ADDED])
        },
    },
},
Query: {
    books: () => books,
    getBooks: (_, { title }) => {
        return books.filter(b => b.title === title);
    },
},
Mutation: {
    addBook: (_, { title, author }, { pubSub }) => {
        const book = { title, author };
        books.push(book);
        pubSub.publish(BOOK_ADDED, {
            bookAdded: book,
        });
        return book;
    },
},
```

This project uses the `apollo-server-hapi` package in order to ensure that smooth setup of hapi and GraphQL.

## Client

The client side is intended to cover a bunch of client-side frameworks. It is to be noted that the interaction of a queries, mutations and subscriptions can be treated separately i.e. the query and mutation interactions can be safely conducted via http whereas the subscription interactions are best server via a bi-directional medium such as websockets.

```
const path = require('path');

module.exports = {
    entry: {
        'angular-app': './src/frontend/angularjs/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'src/backend/server/public'),
        filename: '[name].min.js',
    },
    devtool: 'source-map',
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env'
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.(html)$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
        ],
    },
};
```

### AngularJS

Every interaction for communicating with GraphQL is covered as a service. The AngularJS service is as follows:

```
import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

export default class BookService {
    constructor() {
        // Create an http link
        const httpLink = new HttpLink({
            uri: 'http://localhost:4000/graphql'
        });

        // Create a WebSocket link
        const wsLink = new WebSocketLink({
            uri: 'ws://localhost:4000/graphql',
            options: {
                reconnect: true,
            },
        });

        // using the ability to split links, you can send data to each link
        // depending on what kind of operation is being sent
        const link = split(
            // split based on operation type
            ({ query }) => {
                const definition = getMainDefinition(query);
                return (
                    definition.kind === 'OperationDefinition' &&
                    definition.operation === 'subscription'
                );
            },
            wsLink,
            httpLink,
        );

        this.client = new ApolloClient({
            link,
            cache: new InMemoryCache(),
        });
        this.subscribeToBookAdded();
    }

    getBooks() {
        return this.client.query({
            query: gql`
                query GetBooks {
                    books {
                        title
                        author
                    }
                }
            `,
        });
    }

    addBook(book) {
        const { title, author } = book;
        if (title && author) {
            return this.client.mutate({
                mutation: gql`
                    mutation addBook($title: String!, $author: String!) {
                        addBook(title: $title, author:$author) {
                            title
                            author
                        }
                    }
                `,
                variables: {
                    title,
                    author,
                },
            });
        }
        throw new Error('Cannot add an invalid book');
    }

    subscribeToBookAdded() {
        this.bookAddedSubscription = this.client.subscribe({
            query: gql`
                subscription BookAdded {
                    bookAdded {
                        title
                        author
                    }
                }
            `,
            variables: {},
        });
        return this.bookAddedSubscription;
    }
}
```

Any controller can be used with this service to get everything working. A sample controller (this is the used in the code) is a follows:

```
export default class Controller {
    constructor($scope, BookService) {
        'ngInject';

        this.scope = $scope;
        this.bookService = BookService;

        this.books = [];
        this.bookModel = {
            title: '',
            author: '',
        };

        this.getBookList();
        this.addSubscription();  
    }

    addBook() {
        console.log('calling add book');
        this.bookService.addBook(this.bookModel)
            .then(() => this.clearBookModel());
        ;
    }

    addSubscription() {
        this.bookService.subscribeToBookAdded()
            .subscribe({
                next: (result) => {
                    const { bookAdded } = result.data;
                    if (bookAdded) {
                        this.books.push(bookAdded);
                        this.scope.$apply();
                    }
                    return result;
                },
                error: (err) => {
                    console.log('Error- ', err);
                }
            });
    }

    clearBookModel() {
        this.bookModel = {
            title: '',
            author: '',
        };
        this.scope.$apply();
    }

    getBookList() {
        this.bookService.getBooks()
            .then((result) => {
                this.books = [];
                const immutableBooks = result.data.books;
                this.books = JSON.parse(JSON.stringify(immutableBooks));
                this.scope.$apply();
            });
    }

    subscribeToBookAdded() {
        this.bookService.bookAddedSubscription
            .subscribe({
                next: (result) => {
                    console.log('Subscription data:', result);
                    const { bookAdded } = result.data;
                    if (bookAdded) {
                        this.books.push(bookAdded);
                        this.scope.$apply();
                    }
                    return bookAdded;
                },
                error: err => {
                    console.error('Subscription error:', err);
                }
            });
    }
}

```
