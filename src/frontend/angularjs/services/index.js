import angular from 'angular';
import BookService from './book.service';

export default angular.module('bookApp.service', [])
    .service('BookService', BookService)
    .name;
