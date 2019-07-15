import '@babel/polyfill';
import angular from 'angular';

import BookService from './services';

import bookTemplate from './book.template.html';
import bookController from './book.controller';

export default angular.module('bookApp', [ BookService ])
    .component('bookList', {
        template: bookTemplate,
        controller: bookController,
        controllerAs: '$ctrl',
    })
    .service
    .name;
