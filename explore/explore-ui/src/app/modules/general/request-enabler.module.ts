import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestEnablerInterceptor } from './request-enabler.interceptor';

/*
 General Module for enabling the token from URl
 */

@NgModule({
    declarations : [],
    imports : [
        CommonModule
    ],
    providers : [{
     provide : HTTP_INTERCEPTORS,
     useClass : RequestEnablerInterceptor,
     multi : true
    }]
})

export class RequestEnablerModule { }
