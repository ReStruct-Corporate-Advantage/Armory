import {LiquidityHorizonCalendarDay} from '../../enums/liquidity-horizon-calendar-day.enum';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {HorizonLiquiditySettings} from './horizon-liquidity-settings.model';

describe('HorizonLiquiditySettings test', () => {
    let horizonLiquiditySettings: HorizonLiquiditySettings;

    beforeEach(() => {
        horizonLiquiditySettings = new HorizonLiquiditySettings();
        horizonLiquiditySettings.initialize(new Map<string, boolean>());
    });

    it('Test model initialization', () => {
        expect(horizonLiquiditySettings).toBeDefined();
        expect(horizonLiquiditySettings.calendarDays).toBe(0);
        expect(horizonLiquiditySettings.timeHorizons.length).toBe(13);
    });

    it('Test deserialize', () => {
        const data: any = {
            calendarDays: 0, timeHorizons: LiquidityHorizonCalendarDay.getCumulativeTimeHorizon()
        };
        horizonLiquiditySettings.deserialize(data);
        expect(horizonLiquiditySettings.calendarDays).toBe(0);
        expect(horizonLiquiditySettings.timeHorizons.length).toBe(13);
    });

    it('Test addRequestParams', () => {
        const requestParam: any = {};
        horizonLiquiditySettings.timeHorizons = LiquidityHorizonCalendarDay.getCumulativeTimeHorizon();
        horizonLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.timeHorizons.length).toBe(13);
    });

    it('Test addRequestParams with empty timeHorizons', () => {
        const requestParam: any = {};
        horizonLiquiditySettings.timeHorizons = [];
        horizonLiquiditySettings.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.timeHorizons).toBeUndefined();
    });

    it('Test serialize', () => {
        horizonLiquiditySettings.timeHorizons = LiquidityHorizonCalendarDay.getCumulativeTimeHorizon();
        const data = horizonLiquiditySettings.serialize();

        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.calendarDays).toBe(0);
        expect(data.timeHorizons.length).toBe(13);
    });

    describe('Test equals', () => {
        it('If not instance of HorizonLiquidationSettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(horizonLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const horizonLiquiditySettingsOther = new HorizonLiquiditySettings();
            horizonLiquiditySettingsOther.initialize(new Map<string, boolean>());

            expect(horizonLiquiditySettings.equals(horizonLiquiditySettingsOther)).toBeTruthy();

            horizonLiquiditySettingsOther.calendarDays = LiquidityHorizonCalendarDay.DISCRETE;
            expect(horizonLiquiditySettings.equals(horizonLiquiditySettingsOther)).toBeFalsy();
        });
    });
});
