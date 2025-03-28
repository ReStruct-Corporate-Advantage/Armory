import {ScenarioConstants} from '../../constants/scenario.constant';
import {ColumnOptionFactory} from '@blk/explore-ui-core';
import {ShockSettingColumnOption} from '../column-option/shock-setting-column-option.model';
import {SpecifiedShockScenario} from './specified-shock-scenario.model';

describe('Specified shock scenario model', () => {

    let specifiedShockScenario: SpecifiedShockScenario;

    const data = {
        dxsShockUnit: ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD,
    };

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ShockSettingColumnOption.CONFIG_TYPE, ShockSettingColumnOption);
    });

    beforeEach(() => {
        specifiedShockScenario = new SpecifiedShockScenario(data);
    });

    it('Test model initialization', () => {
        expect(specifiedShockScenario).not.toBeUndefined();
        expect(specifiedShockScenario).not.toBeNull();
    });

    it('Test deserialize', () => {
        // called from constructor from beforeEach
        expect(specifiedShockScenario.dxsShockUnit).toEqual(ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD);
    });


    it('test addRequestParams', () => {
        const expectedParams = {
            dxsShockUnit: ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD,
        };
        const params: any = {};
        specifiedShockScenario.addRequestParams(params);
        expect(params).toEqual(expectedParams);
    });

});

