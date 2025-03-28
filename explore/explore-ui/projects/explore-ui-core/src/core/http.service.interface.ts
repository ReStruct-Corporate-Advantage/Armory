import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

/**
 * HttpServiceInterface
 * Library Consumers need to implement this interface and provide the token: HTTP_SERVICE_TOKEN
 */
export interface HttpServiceInterface {
    /**
     * BMS request for getting data
     * @param command BMS command
     */
    get$(command: string, params?: HttpParams): Observable<any>;

    /**
     * BMS request for posting data
     * @param command BMS command
     */
    post$(command: string, data: any, params?: HttpParams, initialResponseCallback?: () => void): Observable<any>;
}
