import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RequestConstants, StatusConstants} from '../../../constants';
import {MetadataModule} from '../metadata.module';
import {Http2BmsService} from '@services/bms';
import {HttpUtils} from '../../../utils';
import {CoreDefinitionStore, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

@Injectable({
    providedIn: MetadataModule
})
export class UserMetaDataService {
    constructor(private http2BmsService: Http2BmsService) {
    }

    /**
     * fetch UserMetaData and save the data in userMetaData
     */
    fetchUserMetaData$(): Observable<UserMetaData> {
        const params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.CHECKING_ACCESS);
        return this.http2BmsService.get$(RequestConstants.GET_USER_META_DATA, params).pipe(
            map((payload: any): UserMetaData => {
                // The data attribute is not always there, this can happen if the user does not have access to Explore.
                if (payload.data) {
                    payload = payload.data;
                }

                // Set and return the user metadata.
                CoreUserMetaDataStore.userMetaData = new UserMetaData(payload);
                CoreDefinitionStore.tokens = payload.tokens;
                return CoreUserMetaDataStore.userMetaData;
            })
        );
    }

    /**
     * Setting the user preference.
     */
    setUserPreference(property: string, value: string): void {
        // Send the request to set the user preference.
        // We do not need to check/wait for the reply.
        const data = {property, value};
        this.http2BmsService.post$(RequestConstants.SET_USER_PREFERENCE, data);
    }
}
