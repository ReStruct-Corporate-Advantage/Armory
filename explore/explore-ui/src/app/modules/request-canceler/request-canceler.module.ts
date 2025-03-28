import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {CancelRequestInterceptor} from './cancel-request.interceptor';

/**
 * Module for cancelling the requests
 */
@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: CancelRequestInterceptor,
        multi: true
    }]
})
export class RequestCancelerModule { }
