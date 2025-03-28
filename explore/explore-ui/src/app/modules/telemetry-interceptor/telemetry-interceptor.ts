import {Injectable} from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpParams,
    HttpRequest
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TelemetryActionConstants, TelemetryService} from '@blk/explore-ui-core';

@Injectable()
export class TelemetryInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // only intercept request if addRequestIdToTelemetryPayload is true
        if (req.params.get(TelemetryActionConstants.ADD_REQUEST_ID_TO_TELEMETRY_PAYLOAD) === 'true') {
            req.params.keys().forEach(key => {
                if (key === TelemetryActionConstants.ADD_REQUEST_ID_TO_TELEMETRY_PAYLOAD) {
                    return;
                }
                const payload = req.body[req.params.get(key)];
                payload.requestId = req.body.requestId;
                // track event with its payload
                TelemetryService.track(key, payload);
                // clear out the payload so that it is not sent as a part of request
                delete req.body[req.params.get(key)];
            });
            const clonedReq = req.clone({
                body: req.body,
                context: req.context,
                headers: req.headers,
                method: req.method,
                params: new HttpParams(),
                reportProgress: req.reportProgress,
                responseType: req.responseType,
                url: req.url,
                withCredentials: req.withCredentials
            });
            return next.handle(clonedReq);
        }
        return next.handle(req);
    }
}
