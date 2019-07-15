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

        this.bookAddedSubscription.subscribe((data) => console.log('from service, subscription:', data));
        return this.bookAddedSubscription;
    }
}
