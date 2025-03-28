import {DecarbonizationChartWidgetDataService} from './decarbonization-chart-widget-data.service';
import {validateService} from '@services/widget/functions-for-data-service.testutil';
import {
    WidgetConfigType,
    WidgetInput,
} from '@blk/explore-ui-core';
import { DecarbonizationChartSettings } from '../../../models/widget/inputs/decarbonization-chart-settings.model';

describe('DecarbonizationChartWidgetDataService Test', () => {

    let service: DecarbonizationChartWidgetDataService;
    let widgetInputs: Map<string, WidgetInput>;

    /**
     * Performs required initialisation
     */
    beforeEach(() => {
        service = new DecarbonizationChartWidgetDataService(null);
        widgetInputs = new Map<string, WidgetInput>();
    });

    it('Test noDataResponse', () => {
        let response: any = {
            data: {
                data: {
                    children: [
                        {
                            data: [null]
                        },
                        {
                            data: [null]
                        }
                    ]
                }
            }
        };

        expect(service['noDataResponse'](response)).toBe('No data is available for the selected date');
        response = {
            data: {
                data: {
                    children: [
                        {
                            data: [null]
                        },
                        {
                            data: [null]
                        }
                    ]
                },
            },
            message : 'Unexpected error'
        };

        expect(service['noDataResponse'](response)).toBe('No data in the response, response.message =Unexpected error');
        response = {
            data: {
                data: {
                    data: [null, null]
                }
            },
        };
        expect(service['noDataResponse'](response)).toBe('No data is available for the selected date');

        response = {
            data: {
                data: {
                    data: [null, null]
                }
            },
            message : 'Unexpected error'
        };
        expect(service['noDataResponse'](response)).toBe('No data in the response, response.message =Unexpected error');
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.DECARBONIZATION_WIDGET], 'Y');
    });

    it('should test customVizConfig', () => {
        widgetInputs.set('chart', {chartType: 'line', sortedColumns: []} as any);
        const widget = {
            displayInputs: widgetInputs,
            dataStore: {
                metaData: {
                    inputs: new Map<string, WidgetInput>()
                }
            }
        };
        expect(service['customVizConfig'](widget, widgetInputs));
    });

    it('test  modifyWidgetInputsForRequest', () => {
        // noinspection JSUnusedLocalSymbols
        const spy2 = jest.spyOn(DecarbonizationChartWidgetDataService, 'applyWidgetDecarbonizationSettings');

        // Execute the method
        service['modifyWidgetInputsForRequest'](widgetInputs, null);

        expect(spy2).toHaveBeenCalledWith(widgetInputs);
        expect(spy2).toHaveBeenCalledTimes(1);
    })


    it('Test getDecarbWidgetColumns', () => {
        const data = {
            columnTag: "ta_rev_int_s12",
            positionColumnType: "PORT",
            selectedScenario: "Nationally Determined Contributions",
            emissionStartYear: "2049",
            aggregationMethod: 1401,
            emissionTargetType: "TA_METRIC_CODE_PRIORITY",
            portfolioTargets: []
        }
        const settings = new DecarbonizationChartSettings({...data, portfolioTargets: [{label:'Portfolio Target 1', reductionPercent:40, startYear:'2019', targetYear:'2020'}]});
        expect(DecarbonizationChartWidgetDataService['getDecarbWidgetColumns'](settings)).toEqual(
            [{"columnKey": "ta_rev_int_s12-base", "columnTag": "ta_rev_int_s12", "optionValues": [{"value": 1401}, {"climateScenario": [{"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2049", "scenarioYearDisplayName": "2049"}, {"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2050", "scenarioYearDisplayName": "2050"}], "targetTypes": ["TA_METRIC_CODE_PRIORITY"]}], "positionColumnType": "PORT"}, {"columnKey": "ta_rev_int_s12-portfolioTarget_1", "columnTag": "ta_rev_int_s12", "optionValues": [{"value": 1401}, {"climateScenario": [{"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2019", "scenarioYearDisplayName": "2019"}, {"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2020", "scenarioYearDisplayName": "2020"}], "decarbonizationReductionTarget": 40, "targetTypes": ["TA_METRIC_CODE_PRIORITY"]}], "positionColumnType": "PORT"}]
        )
    });
    it('Test getDecarbWidgetColumnsForNoEmissionTargets', () => {
        const data = {
            columnTag: "ta_rev_int_s12",
            positionColumnType: "PORT",
            selectedScenario: "Nationally Determined Contributions",
            emissionStartYear: "2049",
            aggregationMethod: 1401,
            portfolioTargets: []
        }
        const settings = new DecarbonizationChartSettings({...data, portfolioTargets: [{label:'Portfolio Target 1', reductionPercent:40, startYear:'2019', targetYear:'2020'}]});
        expect(DecarbonizationChartWidgetDataService['getDecarbWidgetColumns'](settings)).toEqual(
            [{"columnKey": "ta_rev_int_s12-base", "columnTag": "ta_rev_int_s12", "optionValues": [{"value": 1401}, {"climateScenario": [{"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2049", "scenarioYearDisplayName": "2049"}, {"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2050", "scenarioYearDisplayName": "2050"}], "hideTargets": true}], "positionColumnType": "PORT"}, {"columnKey": "ta_rev_int_s12-portfolioTarget_1", "columnTag": "ta_rev_int_s12", "optionValues": [{"value": 1401}, {"climateScenario": [{"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2019", "scenarioYearDisplayName": "2019"}, {"preventSpawnChildColumn": undefined, "scenarioPercentile": "mean", "scenarioPercentileDisplayName": "mean", "scenarioType": "Nationally Determined Contributions", "scenarioTypeDisplayName": "Hot House World - Nationally Determined Contributions", "scenarioYear": "2020", "scenarioYearDisplayName": "2020"}], "decarbonizationReductionTarget": 40, "hideTargets": true}], "positionColumnType": "PORT"}]
        )
    });
});
