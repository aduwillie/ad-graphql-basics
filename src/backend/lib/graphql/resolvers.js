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

const BOOK_ADDED = 'BOOK_ADDED';

module.exports = {
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
};
