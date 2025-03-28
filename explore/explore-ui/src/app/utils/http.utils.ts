import {HttpParams} from '@angular/common/http';
import {CommonUtils, CoreRequestConstants} from '@blk/explore-ui-core';
import {RequestConstants} from '../constants';

/**
 * Http Utils
 */
export class HttpUtils {
    /**
     * Generates a  and adds it to the params for the request.
     * Takes an HttpParams and return a new one after adding loading key/message to it since HttpParams is immutable.
     *
     * @param params params instance
     * @param loadingMessage spinner message
     * @param enableClickOnBackground to decide is background clicking should be allowed on spinner
     */
    static getCopiedParamWithLoadingKeyAndMessage(params: HttpParams, loadingMessage: string, enableClickOnBackground?: boolean): HttpParams {
        const loadingKey = CoreRequestConstants.LOADING_PREFIX + CommonUtils.generateUniqueIdAsString(7);

        // HttpParams is immutable and doesn't allow to add things.
        // therefore, using params.set to create a clone and re-assigning it back.
        params = params.set(CoreRequestConstants.LOADING_KEY, loadingKey);
        if (enableClickOnBackground) {
            params = params.set(RequestConstants.ENABLE_BACKGROUND_CLK, enableClickOnBackground.toString());
        }
        return params.set(CoreRequestConstants.LOADING_MESSAGE, loadingMessage);
    }
}
