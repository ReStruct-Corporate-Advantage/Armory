/**
 * This interface will be implemented by any model that can create request params.
 * (And the request is the one that will be sent across the wire to the backend server)
 */
export interface RequestParamsCreator {

    /**
     * Adds request parameters to the given request parameters
     * @param requestParams the parameters of the request that will be sent across the wire to the backend server.
     * @param paramName a request parameter name, which the implementors may choose to use should they only add
     * one parameter. The parameter name may not be always passed so the implementors need to use a default parameter
     * name in that case.
     * @param isExportRequest - flag if the request is export related
     * @param isBatchExport - flag if the request is for batch export
     */
    addRequestParams(requestParams: any, paramName?: string, isExportRequest?: boolean, isBatchExport?: boolean): void;
}
