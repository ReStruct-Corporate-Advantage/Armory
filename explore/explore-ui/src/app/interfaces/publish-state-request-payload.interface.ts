/**
 * Interface for publish state request payload
 */
export interface PublishStateRequestPayload {
    portfolio: string;
    forDate: string;
    publishRequestBenchName: string;
    publishRequestBenchSelection: string;
    isIndexHistoryPort: boolean;
    publishRequestBenchOrder?: number;
    isLookThroughEnabled?: boolean;
    isBenchLookThroughEnabled?: boolean;
    ltSecurityProxyTypes?: string[];
    ltSecurityTypes?: string[];
}
