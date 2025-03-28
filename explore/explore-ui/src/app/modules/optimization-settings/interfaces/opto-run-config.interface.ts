/**
 * interface for optimization run that propagates via output event
 */
export interface OptoRunConfig {
    mipTimeLimit: number;
    hardRefresh?: boolean;
    debugContext?: boolean;
}
