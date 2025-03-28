import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {BehaviorSubject} from 'rxjs';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import {TelemetryContextUtils} from '@utils/telemetry-context.utils';
import {ReportGroup} from '@models/workspace/report-group.model';

describe('TelemetryContextUtils Test', () => {
    const workpad = new ReportGroup();
    const portfolio1 = new Portfolio('SNP500');
    const portfolio2 = new Portfolio('PEP');
    const report = new Report('Test Report');

    beforeEach(() => {
        portfolio1.portId = 'SNP500123123123123123';
        portfolio2.portId = 'PEP123123123123123';

        report.comparisonConfigId = 123;
        report.owner = 'seakim';

        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList.push('SNP500123123123123123', 'PEP123123123123123')
        workpad.comparisonConfigMap.set(123, comparisonConfig);
        workpad.portfolios.push(portfolio1, portfolio2);

        WorkspaceStore.currentWorkpad$ = new BehaviorSubject(workpad);
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject(portfolio1);
        WorkspaceStore.currentReport$ = new BehaviorSubject(report);
    });


    it('should test getAnalysisContext', () => {
        expect(TelemetryContextUtils.getAnalysisContext().portfolioTickers).toEqual(['SNP500', 'PEP']);
        expect(TelemetryContextUtils.getAnalysisContext().isComparisonEnabled).toEqual(true);
        expect(TelemetryContextUtils.getAnalysisContext().reportTitle).toEqual('Test Report');
        expect(TelemetryContextUtils.getAnalysisContext().reportId).toBeDefined()
        expect(TelemetryContextUtils.getAnalysisContext().reportOwner).toEqual('seakim');
    });
    it('should test getAnalysisContext no workspace present', () => {
        WorkspaceStore.currentWorkpad$ = new BehaviorSubject(undefined);
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject(undefined);
        WorkspaceStore.currentReport$ = new BehaviorSubject(undefined);
        expect(TelemetryContextUtils.getAnalysisContext().portfolioTickers).toBeUndefined();
        expect(TelemetryContextUtils.getAnalysisContext().isComparisonEnabled).toEqual(false);
        expect(TelemetryContextUtils.getAnalysisContext().reportTitle).toBeUndefined();
        expect(TelemetryContextUtils.getAnalysisContext().reportId).toBeUndefined();
        expect(TelemetryContextUtils.getAnalysisContext().reportOwner).toBeUndefined();
    });
});
