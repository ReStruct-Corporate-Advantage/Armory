import { TypeInInvestmentUniverse } from '../../enums/telemetry-investment-universe-type.enum';
import { TelemetryInvestmentUniverseParameters, TelemetryInvestmentUniverseTypeParameters } from '../../parameters';
import { TelemetryInvestmentUniverseTracker } from './telemetry-investment-universe-run-tracker';

describe('Telemetry Run Investment Universe Tracker', () => {
    it(' it should test generateProtoBuff', () => {
        const trackerInvestment = new TelemetryInvestmentUniverseTracker();
        const params = new TelemetryInvestmentUniverseParameters({
            workspaceId: 123456,
            requestId: 123,
            investmentUniverseTypeAndNamesList: [new TelemetryInvestmentUniverseTypeParameters({investmentUniverseType:TypeInInvestmentUniverse.PORTFOLIO,name: 'PEP'})]
        });
        const stats = trackerInvestment.generateProtoBuff(params);
        expect(stats.getWorkspaceId()).toBe('123456');
        expect(stats.getRequestId()).toBe(123);
        expect(stats.getInvestmentUniverseTypeAndNamesList().map(item => item.toObject())).toEqual([{investmentUniverseType: 1, name: 'PEP'}]);
    });
});
