import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {loadingReducer} from './store/loading.reducer';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LoadingInterceptor} from './loading.interceptor';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';

/**
 * Module for all the meta data which includes user meta data, column definitions, mandate mapping
 */
@NgModule({
    declarations: [
        LoadingSpinnerComponent
    ],
    imports: [
        CommonModule,
        StoreModule.forFeature('loading', loadingReducer)
    ],
    exports: [
        LoadingSpinnerComponent
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: LoadingInterceptor,
        multi: true
    }]
})
export class LoadingModule { }
