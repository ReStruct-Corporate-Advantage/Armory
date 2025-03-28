import {TelemetryRiskBudgetingParameters, TelemetryTierDefinitionRiskBudgetingParameters} from '../../parameters';
import {TelemetryRiskBudgetingTracker} from './telemetry-risk-budgeting-tracker';

describe('Telemetry Risk Budgeting Tracker', () => {
    it('should test generateProtoBuff', () => {
        const tracker = new TelemetryRiskBudgetingTracker();
        const riskBudgetingParameters =  new TelemetryRiskBudgetingParameters({'isScreeningEnabled': true, 'isSecurityConstraintApplied': true, 'riskBudgetingCase': 1, 'tierDefinitionInfo': new TelemetryTierDefinitionRiskBudgetingParameters({'definitionType': 'NAME', 'tierOne': undefined, 'tierThreeRatio': 0, 'tierTwo': undefined, 'tierTwoRatio': 0})});
        const stats = tracker.generateProtoBuff(riskBudgetingParameters);
        expect(stats.getScreeningEnabled()).toBe(true);
        expect(stats.getSecurityConstraintsApplied()).toBe(true);
    });
});
