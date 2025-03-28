import {TestBed} from '@angular/core/testing';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';

import {FactorDataSpriteletLauncherService} from '@services/spritelet-launcher/factor-data-spritelet-launcher.service';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {DEFAULT_QUERY_KEY} from '@qbstr/data-cube';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {NotificationService} from '@services/notification';

describe('FactorDataSpriteletLauncherService', () => {
    let service: FactorDataSpriteletLauncherService;

    let parentWidget: Widget;
    let spriteletEventLeafNode;
    let spriteletEventGroupNode;
    let spriteletEventForMatrixColumnsCase;
    const notificationServiceStub = {
        error: jest.fn(),
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        TestBed.configureTestingModule({
            providers: [
                FactorDataSpriteletLauncherService,
                {provide: NotificationService, useValue: notificationServiceStub},
            ],
        });
        service = TestBed.inject(FactorDataSpriteletLauncherService);

        parentWidget = new Widget(WidgetConfigType.PRA);

        const cube = new SimpleCube([]);
        const data = [
            {
                _ROOT_: 'PEP',
                'level-1': 'A',
                'level-2': 'B',
                rfv_factor_tag_hidden: 'factor1',
                rfv_ftitle_long_hidden: 'factor 1',
            },
            {
                _ROOT_: 'PEP',
                'level-1': 'A',
                'level-2': 'B',
                rfv_factor_tag_hidden: 'factor2',
                rfv_ftitle_long_hidden: 'factor 2',
            },
            {
                _ROOT_: 'PEP',
                'level-1': 'A',
                'level-2': 'C',
                rfv_factor_tag_hidden: 'factor3',
                rfv_ftitle_long_hidden: 'factor 3',
            },
            {
                _ROOT_: 'PEP',
                'level-1': 'A',
                'level-2': 'C',
                rfv_factor_tag_hidden: 'factor4',
                rfv_ftitle_long_hidden: 'factor 4',
            },
            {
                _ROOT_: 'PEP',
                'level-1': 'A',
                rfv_factor_tag_hidden: 'factor5',
                rfv_ftitle_long_hidden: 'factor 5',
            },
        ];

        cube.set(DEFAULT_QUERY_KEY, data);

        parentWidget.dataStore.data = {
            cube,
            breakdownLevels: [
                '_ROOT_',
                'level-1',
                'level-2',
            ],
            requestConfig: {
                columns: [
                    {
                        originalColumnTitle: '',
                        columnTag: 'rfv_factor_tag',
                        columnKey: 'rfv_factor_tag_hidden',
                        columnTitle: '',
                        dataType: 'STRING',
                        isHidden: true,
                        isSubtotalable: false,
                    },
                    {
                        originalColumnTitle: '',
                        columnTag: 'rfv_ftitle_long',
                        columnKey: 'rfv_ftitle_long_hidden',
                        columnTitle: '',
                        dataType: 'STRING',
                        isHidden: true,
                        isSubtotalable: false,
                    },
                ]
            }
        };

        spriteletEventLeafNode = {
            callbackMethodName: 'FACTOR_LEVELS',
            params: {
                node: {
                    data: {
                        _ROOT_: 'PEP',
                        'level-1': 'A',
                        'level-2': 'B',
                        rfv_factor_tag_hidden: 'factor2',
                        rfv_ftitle_long_hidden: 'factor 2',
                    },
                    group: false,
                }
            }
        };

        spriteletEventGroupNode = {
            callbackMethodName: 'FACTOR_LEVELS',
            params: {
                node: {
                    data: {
                        _ROOT_: 'PEP',
                        'level-1': 'A',
                    },
                    group: true,
                }
            }
        };

        spriteletEventForMatrixColumnsCase = {
            callbackMethodName: 'FACTOR_LEVELS',
            params: {
                node: {
                    data: {
                        _ROOT_: 'PEP',
                    },
                    group: false,
                    groupData: {
                        'ag-Grid-AutoColumn': 'abc'
                    }
                }
            }
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(WidgetConfigType.FACTOR_DATA.toString());
    });

    it('should launch a factor data widget with spriteletEvent for Leaf Node', () => {
        service.launchSpritelet(parentWidget, spriteletEventLeafNode);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_DATA);

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnTag).toBe('factor2');

        expect(widgetResult.dataStore.metaData.inputs.has(TimeSeriesSettings.INPUT_CONFIG_NAME)).toBe(true);
        const timeSeriesSettings = (widgetResult.dataStore.metaData.inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings);
        expect(timeSeriesSettings.frequency).toBe('DAILY');
        expect(timeSeriesSettings.periods).toBe(252);
        expect(timeSeriesSettings.chartType).toBe('line');
        expect(timeSeriesSettings.dateFormat).toBe('Aladdin date format');
        expect(timeSeriesSettings.compareModeToggle).toBe(false);

        expect(widgetResult.dataStore.metaData.inputs.has(FactorDataChartSettings.configType)).toBe(true);
        const factorDataChartSettings = (widgetResult.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings);
        expect(factorDataChartSettings.factorTimeSeriesSelectedOption).toBe('FACTOR_LEVELS');
        expect(factorDataChartSettings.isTimeSeriesMode).toBe(true);

        expect(widgetResult.dataStore.metaData.inputs.has(RiskSettings.CONFIG_TYPE)).toBe(true);
    });

    it('should launch a factor data widget with spriteletEvent for Group Node', () => {
        service.launchSpritelet(parentWidget, spriteletEventGroupNode);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_DATA);

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(5);
        expect(metaDataColumns[0].columnTag).toBe('factor1');
        expect(metaDataColumns[1].columnTag).toBe('factor2');
        expect(metaDataColumns[2].columnTag).toBe('factor3');
        expect(metaDataColumns[3].columnTag).toBe('factor4');
        expect(metaDataColumns[4].columnTag).toBe('factor5');

        expect(widgetResult.dataStore.metaData.inputs.has(TimeSeriesSettings.INPUT_CONFIG_NAME)).toBe(true);
        const timeSeriesSettings = (widgetResult.dataStore.metaData.inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings);
        expect(timeSeriesSettings.frequency).toBe('DAILY');
        expect(timeSeriesSettings.periods).toBe(252);
        expect(timeSeriesSettings.chartType).toBe('line');
        expect(timeSeriesSettings.dateFormat).toBe('Aladdin date format');
        expect(timeSeriesSettings.compareModeToggle).toBe(false);

        expect(widgetResult.dataStore.metaData.inputs.has(FactorDataChartSettings.configType)).toBe(true);
        const factorDataChartSettings = (widgetResult.dataStore.metaData.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings);
        expect(factorDataChartSettings.factorTimeSeriesSelectedOption).toBe('FACTOR_LEVELS');
        expect(factorDataChartSettings.isTimeSeriesMode).toBe(true);

        expect(widgetResult.dataStore.metaData.inputs.has(RiskSettings.CONFIG_TYPE)).toBe(true);
    });

    it('should launch notification error for spriteletEvent for Matrixcolumns case', () => {
        jest.spyOn(service['notificationService'], 'error');
        service.launchSpritelet(parentWidget, spriteletEventForMatrixColumnsCase);
        expect(service['notificationService'].error).toBeCalledTimes(1);
        expect(WorkspaceStore.getCurrentReport().widgets.length).toBe(0);
    });
});
