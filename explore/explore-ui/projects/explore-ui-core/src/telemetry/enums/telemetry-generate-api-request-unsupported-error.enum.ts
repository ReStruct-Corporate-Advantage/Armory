/**
 * Enum for Generate API Request Unsupported Error telemetry
 */
export enum GenerateApiRequestUnsupportedError {
    GENERATE_API_REQUEST_UNSUPPORTED_ERROR_UNSPECIFIED = 0,
    // User encounters this error for customized portfolio
    GENERATE_API_REQUEST_UNSUPPORTED_ERROR_CUSTOM_PORTFOLIO = 1,
    // User encounters this error for what if scenario
    GENERATE_API_REQUEST_UNSUPPORTED_ERROR_WHAT_IF = 2,
    // User encounters this error for comparison view
    GENERATE_API_REQUEST_UNSUPPORTED_ERROR_COMPARISON_VIEW = 3
}
