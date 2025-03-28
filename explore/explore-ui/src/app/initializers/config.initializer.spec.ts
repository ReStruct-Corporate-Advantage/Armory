import {ConfigInitializer} from './config.initializer';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {RiskParitySettings} from "../models/portfolio/optimization/risk-parity-settings.model";

describe('ConfigInitializer', () => {
    it('should register what if types', () => {
        const registerConfigTypeSpy = jest.spyOn(ConfigTypeFactory, 'registerConfigType');
        ConfigInitializer.registerWhatIfTypes();
        expect(registerConfigTypeSpy).toHaveBeenCalledTimes(2);
        expect(registerConfigTypeSpy).toHaveBeenNthCalledWith(1, OptimizationSettings.configType, OptimizationSettings);
        expect(registerConfigTypeSpy).toHaveBeenNthCalledWith(2, RiskParitySettings.configType, RiskParitySettings);
        registerConfigTypeSpy.mockRestore();
    });
});
