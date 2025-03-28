/**
 * This interface will be implemented by any model that can create request params but also need FavId
 * (And the request is the one that will be sent across the wire to convert to API Request)
 */
 export interface RequestParamsWithFavCreator {

    /**
     * Adds request parameters to the given request parameters and retain favIds
     * @param requestParams the parameters of the request that will be sent across the wire to the backend server.
     * @param paramName
     */
    addRequestParamsWithFavId(requestParams: any, paramName?: string): void;
}
