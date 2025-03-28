import {Injectable} from '@angular/core';
import {Http2BmsService} from '@services/bms';
import {catchError, map} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {DataRequestConstants} from '@constants/data-request.constants';

/**
 * User request cancel Service
 */
@Injectable({
    providedIn: 'root'
})
export class CancelService {

    constructor(private http2BmsService: Http2BmsService) {
    }

    /**
     * Method to cancel all queued User requests
     */
    cancelAll() {
        return this.http2BmsService.post$(DataRequestConstants.DATA_REQUEST_URL.CANCEL_USER_REQUEST, {cancelAll: true}, null).pipe(map((response: any) => {
            return response;
        }), catchError((error) => {
            return throwError(error);
        }));
    }
}
