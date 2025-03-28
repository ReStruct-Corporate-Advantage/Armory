import {TelemetryInvestmentUniverseTypeParameters} from '../../parameters';
import {TypeInInvestmentUniverse} from '../../enums/telemetry-investment-universe-type.enum';
import {TelemetryInvestmentUniverseTypeTracker} from './telemetry-investment-universe-type-run-tracker';

describe('Telemetry Run Investment Universe Type Tracker', () => {
    it(' it should test generateProtoBuff', () => {
        const trackerInvestment = new TelemetryInvestmentUniverseTypeTracker()
        const params = new TelemetryInvestmentUniverseTypeParameters({
            investmentUniverseType:TypeInInvestmentUniverse.BENCHMARK,
            name:'IP'
        });
        const stats = trackerInvestment.generateProtoBuff(params);
        expect(stats.getName()).toBe('IP');
        expect(stats.getInvestmentUniverseType()).toBe(2);
    });
});
