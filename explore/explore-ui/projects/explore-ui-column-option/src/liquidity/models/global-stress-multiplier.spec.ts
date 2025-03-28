import { GlobalStressMultiplier } from './global-stress-multiplier';

describe('GlobalStressMultiplier', () => {
    describe('constructor', () => {
        it('should create an instance with default value', () => {
            const globalStressMultiplier = new GlobalStressMultiplier();
            expect(globalStressMultiplier).toBeTruthy();
            expect(globalStressMultiplier.marketImpactMultiplier).toBe(GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER);
            expect(globalStressMultiplier.marketDepthMultiplier).toBe(GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER);
            expect(globalStressMultiplier.fixedCostMultiplier).toBe(GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER);
        });

        it('should create an instance with value deserialized from object', () => {
            const data = {
                fixedCostMultiplier: 2.0,
                marketImpactMultiplier: 3.5,
                marketDepthMultiplier: 1.9
            };
            const globalStressMultiplier = new GlobalStressMultiplier(data);
            expect(globalStressMultiplier).toBeTruthy();
            expect(globalStressMultiplier.marketImpactMultiplier).toBe(3.5);
            expect(globalStressMultiplier.marketDepthMultiplier).toBe(1.9);
            expect(globalStressMultiplier.fixedCostMultiplier).toBe(2.0);
        });

        it('should create an instance with value deserialized from legacy object', () => {
            const data = {
                fixedCostMultiplier: 2.0,
                marketImpactMultiplier: 3.5,
                stressMultiplier: 1.9
            };
            const globalStressMultiplier = new GlobalStressMultiplier(data);
            expect(globalStressMultiplier).toBeTruthy();
            expect(globalStressMultiplier.marketImpactMultiplier).toBe(3.5);
            expect(globalStressMultiplier.marketDepthMultiplier).toBe(1.9);
            expect(globalStressMultiplier.fixedCostMultiplier).toBe(2.0);
        });
    });

    describe('test addRequestParams', () => {
        const data = {
            fixedCostMultiplier: 2.0,
            marketImpactMultiplier: 3.5,
            stressMultiplier: 1.9
        };
        const globalStressMultiplier = new GlobalStressMultiplier(data);
        const requestParams: any = {};
        globalStressMultiplier.addRequestParams(requestParams);
        expect(requestParams.marketImpactMultiplier).toBe(3.5);
        expect(requestParams.fixedCostMultiplier).toBe(2.0);
        expect(requestParams.stressMultiplier).toBe(1.9);
    });
});
