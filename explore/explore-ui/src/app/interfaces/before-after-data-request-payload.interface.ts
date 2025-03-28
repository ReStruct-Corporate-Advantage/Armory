import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';

export interface BeforeAfterDataRequestPayload {
    type: string;
    portfolio: string;
    benchmark: string;
    benchSelection: string;
    benchOrder: number;
    forDate: string;
    currency: string;
    columns: any[];
    breakdownTree?: string;
    holidayCalendar: string;
    isSectorView: string;
    isRiskFactorRequest: string;
    isPortGroupSummaryRequest: string;
    isFullySpecifiedPortfolio: string;
    includeAliasPortfolios: boolean;
    holdingChanges?: any[];
    benchmarkHoldingChanges?: any[];
    compositionFilter?: string;
    filterTargetType?: string;
    adhocParams?: AdhocPortParams;
    dataFormat?: string;
    splitPositionTypes: string;
    createOptimizationCashBucket: boolean;
    filter?: string;
    normalizedWidgetFilter?: boolean;
}
