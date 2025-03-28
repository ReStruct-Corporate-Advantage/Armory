import {TimeHorizonLiquiditySettings} from './time-horizon-liquidity-settings.model';

describe('TimeHorizonLiquiditySettings test', () => {
    let timeHorizonLiquiditySettings: TimeHorizonLiquiditySettings;

    beforeEach(() => {
        timeHorizonLiquiditySettings = new TimeHorizonLiquiditySettings(0, 1);
    });

    it('Test model initialization', () => {
        expect(timeHorizonLiquiditySettings).toBeDefined();
        expect(timeHorizonLiquiditySettings.minDays).toBe(0);
        expect(timeHorizonLiquiditySettings.maxDays).toBe(1);
    });

    it('Test deserialize', () => {
        expect(timeHorizonLiquiditySettings.deserialize(null)).toBeUndefined();

        const data: any = {
            minDays: 1, maxDays: 3
        };
        timeHorizonLiquiditySettings.deserialize(data);

        expect(timeHorizonLiquiditySettings.minDays).toBe(1);
        expect(timeHorizonLiquiditySettings.maxDays).toBe(3);
    });

    it('Test addRequestParams', () => {
        let requestParam: any = {};
        timeHorizonLiquiditySettings.addRequestParams(requestParam);

        expect(requestParam).toBeDefined();
        expect(requestParam.minDays).toBe(0);
        expect(requestParam.maxDays).toBe(1);
    });

    it('Test serialize', () => {
        let data = timeHorizonLiquiditySettings.serialize();

        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.minDays).toBe(0);
        expect(data.maxDays).toBe(1);
    });
});
