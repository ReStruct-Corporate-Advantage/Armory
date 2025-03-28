import {ImpliedShockScenario} from './implied-shock-scenario.model';
import {ImpliedShockUnitEnum} from '../../enums/implied-shock-unit.enum';
import {ScenarioConstants} from '../../constants/scenario.constant';
import {ColumnOptionFactory, ColumnConstants} from '@blk/explore-ui-core';
import {ShockSettingColumnOption} from '../column-option/shock-setting-column-option.model';

describe('Implied shock scenario model', () => {

    let impliedShockScenario: ImpliedShockScenario;

    const data = {
        noiseDampening: 'LOW',
        shockCorrelationsDate: '03/12/2021',
        restrictImpliedShocks: 'x,y',
        impliedShockUnit: ImpliedShockUnitEnum.DXS_FACTOR_PCT_SPREAD,
        impliedShocks: [
            {
                columnTag: 'USD_3m',
                columnKey: 'USD_3m_55c1dd2e829545d',
                shockSettings: {
                    shock: 12.4,
                    restrictImpliedShocks: 'a,b'
                }
            }
        ]
    };

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ShockSettingColumnOption.CONFIG_TYPE, ShockSettingColumnOption);
    });

    beforeEach(() => {
        impliedShockScenario = new ImpliedShockScenario(data);
    });

    it('Test model initialization', () => {
        expect(impliedShockScenario).not.toBeUndefined();
        expect(impliedShockScenario).not.toBeNull();
    });

    it('Test deserialize', () => {
        // called from constructor from beforeEach
        expect(impliedShockScenario.noiseDampening).toEqual(data.noiseDampening);
        expect(impliedShockScenario.shockCorrelationsDate).toEqual(data.shockCorrelationsDate);
        expect(impliedShockScenario.restrictImpliedShocks).toEqual([ 'x', 'y' ]);
        expect(impliedShockScenario.impliedShockUnit).toEqual(ImpliedShockUnitEnum.FACTOR_SPECIFIC);
        expect(impliedShockScenario.dxsShockUnit).toEqual(ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD);
        expect(impliedShockScenario.columns.columns.length).toEqual(1);
        expect(impliedShockScenario.columns.columns[0].columnTag).toEqual(data.impliedShocks[0].columnTag);
        expect(impliedShockScenario.columns.columns[0].optionValues.length).toEqual(1);
        expect(impliedShockScenario.columns.columns[0].optionValues[0].serialize()).toEqual(data.impliedShocks[0].shockSettings);
    });


    it('test addRequestParams', () => {
        const expectedRequestParams = {
            'noiseDampening': 'LOW',
            'restrictImpliedShocks': 'x,y',
            'shockCorrelationsDate': '03/12/2021',
            'impliedShockUnit': 'DXS_FACTOR_PCT_SPREAD',
            'columns': [
                {
                    'columnTag': 'USD_3m',
                    'columnKey': 'USD_3m_55c1dd2e829545d',
                    'positionColumnType': 'FACTOR_MODEL',
                    'title': 'USD_3m',
                    'optionValues': {
                        'shockSettings': {
                            'shock': 12.4,
                            'restrictImpliedShocks': 'a,b'
                        }
                    }
                }
            ]
        };

        const params: any = {};
        impliedShockScenario.addRequestParams(params);
        expect(params).toEqual(expectedRequestParams);
    });

    it('test method getParamsForConversionToSpecified', () => {
        const params = impliedShockScenario.getParamsForConversionToSpecified();
        const expectedParams = {
            'type': 'ImpliedScenario',
            'dxsShockUnit': 'PERCENTAGE_OF_SPREAD',
            'scenarioMatrixDateOverride': '03/12/2021',
            'noiseDampening': 'LOW',
            'predictBlock': 'x,y',
            'inputShocks': 'USD_3m:12.4',
            'mappingBlock': 'USD_3m|a&USD_3m|b'
        };
        expect(params).toEqual(expectedParams);
    });

    describe('getDxsShockUnitValue', () => {
        it('should return the correct dxsShockUnit value when impliedShockUnit is FACTOR_SPECIFIC', () => {
            impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_SPECIFIC;
            impliedShockScenario.dxsShockUnit = 'testValue';

            const result = impliedShockScenario.getDxsShockUnitValue();

            expect(result).toBe('testValue');
        });

        it('should return PERCENTAGE_OF_SPREAD when impliedShockUnit is not FACTOR_SPECIFIC', () => {
            impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_LEVELS;

            const result = impliedShockScenario.getDxsShockUnitValue();

            expect(result).toBe(ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD);
        });
    });

    describe('getColKey', () => {
        it('should return columnKey if it exists', () => {
            const column = {
                columnKey: 'testKey',
                isCustomFactor: false,
                columnTag: 'testTag'
            };
            const result = impliedShockScenario['getColKey'](column);
            expect(result).toEqual('testKey');
        });

        it('should return columnTag prefixed with CUSTOM_FACTOR_TAG if columnKey does not exist and isCustomFactor is true', () => {
            const column = {
                isCustomFactor: true,
                columnTag: 'testTag'
            };
            const result = impliedShockScenario['getColKey'](column);
            expect(result.startsWith(ColumnConstants.CUSTOM_FACTOR_TAG)).toBeTruthy();
        });

        it('should return columnTag if columnKey does not exist and isCustomFactor is false', () => {
            const column = {
                isCustomFactor: false,
                columnTag: 'testTag'
            };
            const result = impliedShockScenario['getColKey'](column);
            expect(result.startsWith(column.columnTag)).toBeTruthy();
        });
    });

    describe('getColTitle', () => {
        it('should return CUSTOM_FACTOR_TITLE if isCustomFactor is true', () => {
            const column = {
                isCustomFactor: true
            };
            const result = impliedShockScenario['getColTitle'](column);
            expect(result).toEqual(ColumnConstants.CUSTOM_FACTOR_TITLE);
        });

        it('should return columnTitle if it exists and isCustomFactor is false', () => {
            const column = {
                isCustomFactor: false,
                columnTitle: 'testTitle'
            };
            const result = impliedShockScenario['getColTitle'](column);
            expect(result).toEqual('testTitle');
        });

        it('should return columnTag if columnTitle does not exist and isCustomFactor is false', () => {
            const column = {
                isCustomFactor: false,
                columnTag: 'testTag'
            };
            const result = impliedShockScenario['getColTitle'](column);
            expect(result).toEqual('testTag');
        });
    });

});

