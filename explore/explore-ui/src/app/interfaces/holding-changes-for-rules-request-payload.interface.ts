import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';

export interface HoldingChangesForRulesRequestPayload {
    portfolioName: string;
    includeAliasPortfolios: boolean;
    benchName: string;
    date: string;
    rules: string;
    benchmarkHoldingChanges?: any[];
    portfolioHoldingChanges?: any[];
    compositionFilter?: string;
    filterTargetType?: string;
    portfolioPositionsInHoldingChanges: boolean;
    adhocPortParams?: AdhocPortParams;
}
