import {Observable} from 'rxjs';
import {OptimizationSummary} from '@optimization-settings-configuration/models/optimization-summary.model';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {AuxNotificationGroupConfig} from '@blk/aladdin-angular-components';
import {RiskParityCase} from '@enums/risk-parity-case.enum';

export interface OptimizationService {
    getOptimizationSummaries$(): Observable<OptimizationSummary[]>;

    getOptimizationSummaryData$(optimizationId: string, type: string, subType?: string, riskParitySettings?: boolean): Observable<OptimizationSummaryData>;

    getRunUpdateNotification(): AuxNotificationGroupConfig;

    getRiskParityOptimizationSummaries$(riskParityCase: RiskParityCase): Observable<OptimizationSummary[]>;
}
