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
