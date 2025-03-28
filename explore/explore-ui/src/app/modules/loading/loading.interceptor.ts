import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import * as LoadingActions from './store/loading.actions';
import {RequestConstants} from '../../constants';
import {LoadingMessageInfo} from '@models/loading-message-info.model';
import {isArray} from 'lodash';
import {CoreRequestConstants} from '@blk/explore-ui-core';

/**
 * LoadingInterceptor to intercept HTTP request and response and handle them before passing them along
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    constructor(private store: Store<{}>) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.params.has(CoreRequestConstants.LOADING_MESSAGE)) {
            // dispatch AddLoadingMessage action in params before making the http request
            if (!request.params.get(RequestConstants.LONG_RUNNING_STATUS_ID_PARAM)) {
                this.store.dispatch(new LoadingActions.AddLoadingMessage({
                    key: request.params.get(CoreRequestConstants.LOADING_KEY),
                    messageInfo: new LoadingMessageInfo({
                        message: request.params.get(CoreRequestConstants.LOADING_MESSAGE),
                        enableClickOnBackground: !!request.params.get(RequestConstants.ENABLE_BACKGROUND_CLK)
                    })
                }));
            }

            // to keep the reference of response and make it available in the finalize
            let response: HttpEvent<any>;
            let error: any;

            return next.handle(request).pipe(
                tap({
                    next: (value: HttpEvent<any>) => response = value,
                    error: (err: any) => error = err
                }),
                finalize(() => {
                    if (response instanceof HttpResponse) {
                        if (!isArray(response.body) || (isArray(response.body) && response.body[0] && response.body[0].output.status !== 'LONG_RUNNING')) {
                            // delete the loadingMessageInfo with the loadingKey after the http response
                            this.store.dispatch(new LoadingActions.RemoveLoadingMessage({key: request.params.get(CoreRequestConstants.LOADING_KEY)}));
                        }
                        response = undefined;
                    } else if (error) {
                        this.store.dispatch(new LoadingActions.RemoveLoadingMessage({key: request.params.get(CoreRequestConstants.LOADING_KEY)}));
                        error = undefined;
                    }
                })
            );
        } else {
            return next.handle(request);
        }
    }
}
