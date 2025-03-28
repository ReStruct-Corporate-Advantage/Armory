import {ImpliedShockUnitEnum} from '../enums/implied-shock-unit.enum';
import {ScenarioConstants} from '../constants/scenario.constant';
import {ColumnOptionFactory, DateScenario, DateValue} from '@blk/explore-ui-core';
import {ShockSettingColumnOption} from './column-option/shock-setting-column-option.model';
import {StressScenario} from './stress-scenario.model';
import {ScenarioTypeEnum} from '../enums/scenario-type.enum';
import {ScenarioCategoryEnum} from '../enums/scenario-category.enum';
import { ImpliedShockScenario } from './scenario-types/implied-shock-scenario.model';
import { SpecifiedShockScenario } from './scenario-types/specified-shock-scenario.model';

describe('Stress Scenario model', () => {

    let stressScenario: StressScenario;

    const data = {
        scenName: 'abc',
        scenType: ScenarioTypeEnum.IMPLIED_SHOCK,
        scenDesc: 'abc',
        scenVis: ScenarioConstants.SCENARIO_VISIBILITY.PRIVATE,
        scenCategory: ScenarioCategoryEnum.MY_SCENARIOS,
    };

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ShockSettingColumnOption.CONFIG_TYPE, ShockSettingColumnOption);
    });

    beforeEach(() => {
        stressScenario = new StressScenario(data);
    });

    it('Test model initialization', () => {
        expect(stressScenario).not.toBeUndefined();
        expect(stressScenario).not.toBeNull();
    });

    it('Test constructor', () => {
        stressScenario = new StressScenario();
        expect(stressScenario.scenType).toEqual(ScenarioTypeEnum.IMPLIED_SHOCK);
        expect(stressScenario.impliedShockScenario).not.toBeUndefined();
    });

    it('Test copy', () => {
        const otherStressScenario = new StressScenario();
        otherStressScenario.copy(stressScenario);
        expect(stressScenario).toEqual(otherStressScenario);
    });

    it('Test deserialize', () => {
        // called from constructor from beforeEach
        expect(stressScenario.scenName).toEqual(data.scenName);
        expect(stressScenario.scenType).toEqual(data.scenType);
        expect(stressScenario.scenDesc).toEqual(data.scenDesc);
        expect(stressScenario.scenVis).toEqual(data.scenVis);
        expect(stressScenario.scenCategory).toEqual(data.scenCategory);
        expect(stressScenario.impliedShockScenario).not.toBeUndefined();
    });


    it('test addRequestParams', () => {
        const expectedRequestParams = {
            scenName: 'abc',
            scenType: ScenarioTypeEnum.IMPLIED_SHOCK,
            scenDesc: 'abc',
            scenVis: ScenarioConstants.SCENARIO_VISIBILITY.PRIVATE,
            impliedShockUnit: ImpliedShockUnitEnum.DXS_FACTOR_PCT_SPREAD,
        };

        const params: any = {};
        stressScenario.addRequestParamsForSaveScenario(params);
        expect(params).toEqual(expectedRequestParams);
    });

    it('test getConfigType', () => {
        expect(stressScenario.getConfigType()).toEqual(StressScenario.STRESS_SCENARIO_SETTINGS);
    });

    it('test isDataStoreInput', () => {
        expect(stressScenario.isDataStoreInput()).toBeTruthy();
    });

    it('test equals', () => {
        let error = null;
        try {
            stressScenario.equals(undefined);
        } catch (e) {
            error = e;
        }
        expect(error).not.toBeNull();
    });

    describe('test method addRequestParamsForSpecifiedRequest', () => {
        beforeEach(() => {
            stressScenario.scenType = ScenarioTypeEnum.SPECIFIED_SHOCK;
        });
        it('test if saved specified scenario', () => {
            const params: any = {};
            stressScenario.addRequestParamsForSpecifiedRequest(params);
            const expectedParams = {
                'optionValues': {
                    'scenarioList': [
                        {
                            'type': 'NamedScenario',
                            'scenDescription': 'abc',
                            'scenName': 'abc',
                            'scenCategory': 'My Scenarios'
                        }
                    ]
                }
            };
            expect(params).toEqual(expectedParams);
        });
        it('test if converted from implied scenario', () => {
            stressScenario.convertToSpecifiedShock = true;
            stressScenario.convertFromScenario = ScenarioTypeEnum.IMPLIED_SHOCK;
            stressScenario.impliedShockScenario = new ImpliedShockScenario();
            stressScenario.specifiedShockScenario = new SpecifiedShockScenario();
            const params: any = {};
            stressScenario.addRequestParamsForSpecifiedRequest(params);
            const expectedParams = {
                'optionValues': {
                    'scenarioList': [
                        {
                            'dxsShockUnit': 'PERCENTAGE_OF_SPREAD',
                            'type': 'ImpliedScenario'
                        }
                    ]
                }
            };
            expect(params).toEqual(expectedParams);
        });
        it('test if converted from date range scenario', () => {
            stressScenario.convertToSpecifiedShock = true;
            stressScenario.convertFromScenario = ScenarioTypeEnum.DATE_RANGE;
            stressScenario.dateScenario = new DateScenario();
            stressScenario.dateScenario.id = 'date20410832';
            stressScenario.dateScenario.fromDate = DateValue.newDate('01/15/2021');
            stressScenario.dateScenario.toDate = DateValue.newDate('01/30/2021');
            stressScenario.specifiedShockScenario = new SpecifiedShockScenario();
            const params: any = {};
            stressScenario.addRequestParamsForSpecifiedRequest(params);
            const expectedParams = {
                'optionValues': {
                    'scenarioList': [
                        {
                            'type': 'DateRange',
                            'id': 'date20410832',
                            'data': {
                                'fromDate': {
                                    'dateString': false,
                                    'date': '01/15/2021'
                                },
                                'toDate': {
                                    'dateString': false,
                                    'date': '01/30/2021'
                                }
                            },
                            'scenCode': 'HIST_20210130_20210115',
                            'scenDescription': '',
                            'scenName': '20210115-20210130',
                            'enableDateRange': true
                        }
                    ]
                }
            };
            expect(params).toEqual(expectedParams);
        });
    });

    it('Test shouldSkipSerialize', () => {
        expect(stressScenario.shouldSkipSerialize()).toBe(false);
    });
});
