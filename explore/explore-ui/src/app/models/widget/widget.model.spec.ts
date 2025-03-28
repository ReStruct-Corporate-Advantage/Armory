import {FavoriteConstants} from '@constants/favorite.constants';
import {Widget} from './widget.model';
import {TestUtils} from '@utils/test.utils';
import * as riskExposureOld from '../../../../mocks/riskExposureOld.json';
import {PerformanceSettings, TimePeriod, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {ExpandedState} from './inputs/expanded-state.model';
import {Breakdown, CustomFilter} from '@blk/explore-ui-breakdown';
import {WidgetConfigFactory} from '../../factories';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FilterExcludeKey} from '@qbstr/data-cube';

/**
 * Test cases for RiskAndExposureWidget model
 */
describe('RiskAndExposureWidget', () => {

    let widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Test constructor
     */
    it('constructor', () => {
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        expect(widget.configType).toEqual(WidgetConfigType.RISK_EXPOSURE);
        expect(widget.dataStore).toBeDefined();
        expect(widget.id).toBeDefined();
        expect(widget.title).toBe('Risk and Exposure');
        expect(widget.dataStore.metaData.inputs.get('columns')).toBeDefined();
        expect(widget.dataStore.metaData.inputs.get('columns')).toBeInstanceOf(ColumnSet);
        const colSet = widget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        const expectedColSet = [
            {
                'columnTag': 'security_description',
                'positionColumnType': 'ALL',
                'columnKey': 'security_description_1'
            },
            {
                'columnTag': 'cusip',
                'positionColumnType': 'ALL',
                'columnKey': 'cusip_0'
            },
            {
                'columnTag': 'pct_mv',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_mv_1'
            }
        ];
        expect(colSet.equals(new ColumnSet(expectedColSet))).toBeTruthy();
    });

    /**
     * Test set Config Type
     */
    it('set configType', () => {
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        jest.spyOn(widget, 'initializeInputs').mockImplementation(() => {
        });
        widget.configType = WidgetConfigType.BAR;
        expect(widget.initializeInputs).toHaveBeenCalledWith(true);
    });

    /**
     * Test serialize/deserialize - old favs
     */

    describe('serialize/deserialize Test', () => {
        it('serialize/deserialize - old favs', () => {
            widget = new Widget(null, riskExposureOld);
            const serializedData: any = widget.serialize();
            const newWidget: Widget = new Widget(null, null, widget.dataStore);
            jest.spyOn(newWidget, 'initializeInputs').mockImplementation(() => {
            });
            newWidget.deserialize(serializedData);
            expect(newWidget.equals(widget)).toBe(true);
            expect(newWidget.initializeInputs).toHaveBeenCalledWith(true);
        });

        /**
         * Test serialize/deserialize - old favs with oldProps attribute
         */
        it('serialize/deserialize - old props', () => {
            widget = new Widget(WidgetConfigType.RETURNS_TIME_SERIES);
            const serializedData: any = {
                configType: 'returnsTimeSeries', pnlID: '1', nodeDesc: 'Total', sectorPathRules: [{
                    'lineItem': 'ABS',
                    'newWeight': 10,
                    'ruleType': 'Sector',
                    'sectorRulesInfo': []
                }]
            };
            widget.deserialize(serializedData);
            const spriteletInput = widget.dataStore.metaData.inputs.get('returnSpriteletInput') as ReturnSpriteletInput;
            expect(spriteletInput).toBeDefined();
            expect(spriteletInput.pnlID).toBe('1');
            expect(spriteletInput.nodeDesc).toBe('Total');
            expect(spriteletInput.sectorPathRules.length).toBe(1);
            expect(spriteletInput.sectorPathRules[0].lineItem).toBe('ABS');
            expect(spriteletInput.sectorPathRules[0].newWeight).toBe(10);
            expect(spriteletInput.sectorPathRules[0].ruleType).toBe('Sector');
        });

        /**
         * Test serialize/deserialize - new favs
         */
        it('serialize/deserialize - new favs', () => {
            widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            const serializedData: any = widget.serialize();
            const newWidget: Widget = new Widget(null, null, widget.dataStore);
            jest.spyOn(newWidget, 'initializeInputs').mockImplementation(() => {
            });
            newWidget.deserialize(serializedData);
            expect(newWidget.equals(widget)).toBe(true);
            expect(newWidget.initializeInputs).toHaveBeenCalledWith(true);
        });

        it('serialize/deserialize - new favs, security contribution widget', () => {
            widget = new Widget(WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION);
            widget.isBlock = true;
            widget.blockPath = '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY';
            const serializedData: any = widget.serialize();
            const newWidget: Widget = new Widget(null, null, widget.dataStore);
            jest.spyOn(newWidget, 'initializeInputs').mockImplementation(() => {
            });
            newWidget.deserialize(serializedData);
            expect(newWidget.equals(widget)).toBe(true);
            expect(newWidget.initializeInputs).toHaveBeenCalledWith(true);
        });

        it('serialize/deserialize - PGS chart widget', () => {
            widget = new Widget(WidgetConfigType.PGS_BAR);
            widget.pgsChartPortfolio = 'TR-MULTI';
            const serializedData: any = widget.serialize();
            const newWidget: Widget = new Widget(null, null, widget.dataStore);
            jest.spyOn(newWidget, 'initializeInputs').mockImplementation(() => {
            });
            newWidget.deserialize(serializedData);
            expect(newWidget.pgsChartPortfolio === widget.pgsChartPortfolio).toBe(true);
            expect(newWidget.initializeInputs).toHaveBeenCalledWith(true);
            const newWidget2: Widget = new Widget(WidgetConfigType.PGS_BAR);
            jest.spyOn(newWidget2, 'initializeInputs').mockImplementation(() => {
            });
            newWidget2.pgsChartPortfolio = 'TR-MULTI';
            newWidget2.dataStore = {
                data: {
                    customVizConfig: {
                        queryKeys: []
                    }
                }
            };
            newWidget2.deserialize(serializedData);
            expect(newWidget2.pgsChartInputs.actionKey).toBe('PGS_BAR_CHART_SPRITELET');
            newWidget2.dataStore = {
                data: {
                    customVizConfig: {
                        queryKeys: [new FilterExcludeKey('level-1', ['TR-MULTI'])]
                    }
                }
            };
            newWidget2.deserialize(serializedData);
            expect(newWidget2.pgsChartInputs.actionKey).toBe('PGS_LEAF_BAR_CHART_SPRITELET');
            newWidget2.configType = WidgetConfigType.PGS_TS;
            serializedData['configType'] = 'pgsTs';
            newWidget2.dataStore = {
                data: {
                    customVizConfig: {
                        queryKeys: [new FilterExcludeKey('level-1', ['TR-MULTI'])]
                    }
                }
            };
            newWidget2.deserialize(serializedData);
            expect(newWidget2.pgsChartInputs.actionKey).toBe('PGS_TS_LEAF_CHART_SPRITELET');
            newWidget2.dataStore = {
                data: {
                    customVizConfig: {
                        queryKeys: []
                    }
                }
            };
            newWidget2.deserialize(serializedData);
            expect(newWidget2.pgsChartInputs.actionKey).toBe('PGS_TS_CHART_SPRITELET');
        });

        /**
         * Test deserialize - when a display input has been serialized on the data store.
         */
        it('deserialize - datastore contains display input', () => {
            // create a data store with the expanded state in it.
            const dataStore = new WidgetDataStore();
            const expandedState = new ExpandedState();
            expandedState.updateItem(['BLAH'], true);
            dataStore.metaData.inputs.set(ExpandedState.CONFIG_TYPE, expandedState);

            const widgetData = {
                configType: 'returnsWidget',
                title: 'Return Analysis',
                sizeX: 24,
                sizeY: 6,
                type: 'returnGrid',
                row: 0,
                col: 0,
                id: 1593142830849,
                inputs: null
            };
            widget = new Widget(WidgetConfigType.RETURNS, widgetData, dataStore);

            // After the widget has been created we expect the expanded state to have been moved to the widget inputs.
            expect(dataStore.metaData.inputs.has(ExpandedState.CONFIG_TYPE)).toBeFalsy();
            expect(widget.displayInputs.has(ExpandedState.CONFIG_TYPE)).toBeTruthy();
            expect(widget.displayInputs.get(ExpandedState.CONFIG_TYPE) === expandedState).toBeTruthy();
        });


        it('should set sizeY if undefined (in old explore favorite with FBA widget with footnotes checked, sizeY is undefined)', () => {
            const serializedData = {
                col: 0,
                configType: 'praWidget',
                id: 10416339229,
                infoOpen: true,
                inputs: null,
                row: 0,
                sizeX: 8,
                title: 'Factor Based Analysis',
                type: 'praAgGrid'
            };
            widget = new Widget(WidgetConfigType.PRA, serializedData);
            expect(widget.dimensions.rows).toBe(12);
        });
    });

    it('should return false when widgets are not equal', () => {
        const widget1 = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const widget2 = new Widget(WidgetConfigType.RETURN_ANALYSIS_CHART);

        expect(widget1.equals(widget2)).toBe(false);
    });

    it('returns widget with performance settings', () => {
        const widget1 = new Widget(WidgetConfigType.RETURNS);
        expect(widget1.dataStore.metaData.inputs.get(PerformanceSettings.CONFIG_TYPE) instanceof PerformanceSettings).toBe(true);
    });

    it('setDisplayTitle', () => {
        let widget1 = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget1.setDisplayTitle(null);
        expect(widget1.displayTitle).toBe('Risk and Exposure');
        widget1 = new Widget(WidgetConfigType.RETURNS);
        (widget1.dataStore.metaData.inputs.get('performanceSettings') as PerformanceSettings).timePeriod = new TimePeriod('Month To Date', 1, 'MTD');
        widget1.setDisplayTitle(null);
        expect(widget1.displayTitle).toBe('Return Analysis - Month To Date');
        widget1.setDisplayTitle(null);
        expect(widget1.displayTitle).toBe('Return Analysis - Month To Date');
        
        widget1 = new Widget(WidgetConfigType.PRA);
        (widget1.dataStore.metaData.inputs.get('performanceSettings') as PerformanceSettings).timePeriod = new TimePeriod('Month To Date', 1, 'MTD');
        widget1.setDisplayTitle(null);
        expect(widget1.displayTitle).toBe('Factor Based Analysis');
    });

    it('modifyMetaDataInputs test case', () => {
        let widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        let inputs : Map<string, WidgetInput> = new Map<string, WidgetInput>();
        inputs.set('customFilter', new CustomFilter());
        inputs.set('breakdown', new Breakdown());

        const widgetConfigInputs = WidgetConfigFactory.getInputsForWidgetConfigType(WidgetConfigType.RISK_EXPOSURE);
        widget.modifyMetaDataInputs(inputs, widgetConfigInputs);
        expect(inputs.has('customFilter')).toBeFalsy();
        expect(inputs.has('filter')).toBeTruthy();
        expect(inputs.size).toBe(2);
    });

    describe('deserializeInputs Test', () => {
        it('should save columnWidths from old explore in columnState and remove columnWidths from data', () => {
            const widget1 = new Widget(WidgetConfigType.EXPOST_RETURNS);
            const data = {
                'configType': 'expostReturnsWidget',
                'title': 'Ex-Post Returns',
                'sizeX': 20,
                'sizeY': 6,
                'type': 'expostReturns',
                'row': 6,
                'col': 0,
                'id': 1592459802416,
                'inputs': {
                    'expostReturnSettings': {'timePeriod': {'numberOfPeriods': 1, 'shortName': 'Years'},
                    'expostSettings': {'samplingPeriod': {'numberOfPeriods': 1, 'shortName': 'Months'},
                    'statisticPeriods': [{'numberOfPeriods': 1, 'shortName': 'Months'}], 'categoryBreakdown': true}, 'showBench': false, 'showActive': false},
                    'columnWidths': {
                        'columnWidths': [
                            {'columnKey': 'CumRet|2018', 'columnTag': '2018', 'displayWidth': 82.24609375},
                            {'columnKey': 'CumRet|2017', 'columnTag': '2017'},
                            {'columnKey': 'CumRet|2020', 'columnTag': '2020'},
                            {'columnKey': 'CumRet|2019', 'columnTag': '2019'}
                        ]
                    },
                    'expandedState': {'allExpanded': true}
                }
            };

            widget1['deserializeInputs'](data);

            const columnState = widget1.getColumnState();
            expect(columnState.columns.length).toBe(1);
            expect(columnState.columns[0].columnKey).toBe('CumRet|2018');
            expect(columnState.columns[0].width).toBe(82.24609375);
        });

        it('should not deserialize a filter as part of a widget input', () => {
            const widget1 = new Widget(WidgetConfigType.BAR);
            const data = {
                'configType': 'bar',
                'type': 'bar',
                'inputs': {
                    'filter': {
                        'breakdown': {
                            'subSectors': [
                                {
                                    'breakdownRuleType': 'CustomSector',
                                    'includeOtherBucket': true,
                                    'rule': {
                                        'colTag': 'sec_group',
                                        'compType': 'Equals',
                                        'colType': 'STRING',
                                        'ruleType': 'Rule',
                                        'colTitle': 'Security Group',
                                        'colPositionColumnType': 'ALL',
                                        'compValues': [
                                            'EQUITY'
                                        ],
                                        'customSectorType': 'Attributes'
                                    },
                                    'title': 'Custom Sector'
                                }
                            ]
                        }
                    }
                }
            };

            widget1['deserializeInputs'](data);

            // Validate that we didn't get a customFilter attribute.
            expect(widget1.getCombinedInputs().get(CustomFilter.CONFIG_TYPE)).toBeUndefined();

            // Get the filter and make sure that it is empty, if so then it ignored the filter passed above.
            const filter = widget1.getCombinedInputs().get(FavoriteConstants.FILTER_LOWER) as CustomFilter;
            expect(filter).not.toBeUndefined();
            expect(filter.isFilterEmpty()).toBeTruthy();
        });
    });
});
