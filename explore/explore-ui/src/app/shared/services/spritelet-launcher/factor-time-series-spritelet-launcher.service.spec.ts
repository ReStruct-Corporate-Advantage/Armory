import {TestBed} from '@angular/core/testing';

import {FactorTimeSeriesSpriteletLauncherService} from './factor-time-series-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {NOTIFICATION_SERVICE_TOKEN, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet, OverrideDateColumnOption} from '@blk/explore-ui-column-option';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';

describe('FactorTimeSeriesSpriteletLauncherService', () => {
    let service: FactorTimeSeriesSpriteletLauncherService;

    let parentWidget: Widget;
    let parentColumnSet: ColumnSet;
    let spriteletColumnEvent;
    let spriteletRowEvent;

    let notificationServiceMock;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        notificationServiceMock = {
            error: jest.fn()
        };
        TestBed.configureTestingModule({
            providers: [
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}
            ]
        });
        service = TestBed.inject(FactorTimeSeriesSpriteletLauncherService);

        parentWidget = new Widget(WidgetConfigType.PRA);
        parentColumnSet = new ColumnSet({
            columns: [
                {
                    columnKey: 'rfv_ftitle_123',
                    columnTag: 'rfv_ftitle',
                    columnTitle: 'Title',
                    optionValues: [],
                    positionColumnType: 'ALL'
                }, {
                    columnKey: 'rfv_factor_type_2',
                    columnTag: 'rfv_factor_type',
                    columnTitle: 'Factor Type',
                    optionValues: [],
                    positionColumnType: 'ALL'
                }, {
                    columnKey: 'rfv_factor_lvl_6e83ed2dca37475',
                    columnTag: 'rfv_factor_lvl',
                    columnTitle: 'Factor Level',
                    optionValues: [],
                    positionColumnType: 'ALL'
                }, {
                    columnKey: 'rfv_contrib_port_4',
                    columnTag: 'rfv_contrib_port',
                    columnTitle: 'Risk Contribution',
                    optionValues: [],
                    positionColumnType: 'PORT'
                }, {
                    columnKey: 'rfv_contrib_bench_674',
                    columnTag: 'rfv_contrib_bench',
                    columnTitle: 'Benchmark Risk Contribution',
                    optionValues: [],
                    positionColumnType: 'BENCH'
                }, {
                    columnKey: 'expsr_contr_df818dd7223949b',
                    columnTag: 'expsr_contr',
                    columnTitle: 'Average Factor Exposure (1 MTD)',
                    optionValues: [],
                    positionColumnType: 'PORT'
                }
            ]
        });
        parentWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, parentColumnSet);
        parentWidget.dataStore.metaData.inputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, Breakdown.getDefaultFactorBreakdown());

        spriteletColumnEvent = {
            params: {
                column: {
                    getColId: () => 'rfv_contrib_port_4'
                },
                defaultItems: ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll', 'separator', 'separator', 'resetColumns'],
                api: {
                    getDisplayedRowAtIndex: () => ({
                        data: {
                            expsr_contr_df818dd7223949b: 100.00000000000001,
                            rfv_block_path: '15529fbdfce961abb73f1dab56566eaa1fdc6269__1',
                            rfv_contrib_bench_674: 1379.537636572904,
                            rfv_contrib_port_4: 1349.4565396584578,
                            rfv_factor_lvl_6e83ed2dca37475: null,
                            rfv_factor_type_2: '',
                            rowId: 1,
                            sectorOrder: undefined,
                            _ROOT_: 'PEP'
                        }
                    })
                }
            }
        };

        spriteletRowEvent = {
            params: {
                column: {
                    getColId: () => 'ag-Grid-AutoColumn',
                    getColDef: () => ({field: 'rfv_ftitle'})
                },
                node: {
                    field: '_ROOT_',
                    key: 'PEP',
                    level: 0,
                    group: true,
                    parent: {
                        field: undefined,
                        key: null,
                        level: -1
                    },
                    data: {
                        expsr_contr_df818dd7223949b: 100.00000000000001,
                        rfv_block_path: '15529fbdfce961abb73f1dab56566eaa1fdc6269__1',
                        rfv_contrib_bench_674: 1379.537636572904,
                        rfv_contrib_port_4: 1349.4565396584578,
                        rfv_factor_lvl_6e83ed2dca37475: null,
                        rfv_factor_type_2: '',
                        rowId: 1,
                        sectorOrder: undefined,
                        _ROOT_: 'PEP'
                    }
                }
            }
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES.toString());
    });

    it('should launch a factor time series chart from a column', () => {
        service.launchSpritelet(parentWidget, spriteletColumnEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toEqual(true);
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeDefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('rfv_contrib_port_4');

        expect(widgetResult.dataStore.metaData.inputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toEqual(true);
        expect((widgetResult.dataStore.metaData.inputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN) as Breakdown).equals(Breakdown.getDefaultFactorBreakdown())).toBe(true);
    });

    it('should launch factor time series chart from a row cell in a specific column', () => {
        spriteletColumnEvent.params.node = {
            key: null,
            data: {
                rfv_ftitle_123: 'United Kingdom',
                rfv_factor_type_2: 'Country Return',
                rfv_factor_lvl_6e83ed2dca37475: 76.82701796304391,
                rfv_contrib_port_4: -0.19407546497344552,
                rfv_contrib_bench_674: -0.11,
                expsr_contr_24ddaccd47f7452: 0.5270563080991079,
                rfv_block_path: '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR',
                _ROOT_: 'PEP',
                'level-1': 'COUNTRY'
            },
            level: 2,
            group: false,
            parent: {
                field: '_ROOT_',
                key: 'PEP',
                level: 0,
                group: true,
                parent: {
                    field: undefined,
                    key: null,
                    level: -1
                }
            }
        };

        service.launchSpritelet(parentWidget, spriteletColumnEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBe(true);
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeDefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('rfv_contrib_port_4');

        expect(widgetResult.dataStore.metaData.inputs.has(FactorPathInput.configType)).toBe(true);
        const factorPathInput = (widgetResult.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput);
        expect(factorPathInput.path).toHaveLength(2);
        expect(factorPathInput.path[0].level).toEqual(ROOT_LEVEL);
        expect(factorPathInput.path[0].value).toEqual('PEP');
        expect(factorPathInput.path[1].level).toEqual('rfv_block_path');
        expect(factorPathInput.path[1].value).toEqual('15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR');

        const chartSettings = (widgetResult.dataStore.metaData.inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings);
        expect(chartSettings.includeTotalValues).toEqual(false);

        expect(widgetResult.dataStore.metaData.inputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toEqual(true);
        expect((widgetResult.dataStore.metaData.inputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN) as Breakdown).equals(Breakdown.getDefaultFactorBreakdown())).toBe(true);
    });

    it('should remove override date column option when factor time series chart launched', () => {
        const overrideDateColumn = parentColumnSet.columns.find(col => col.columnKey === 'rfv_contrib_port_4');
        overrideDateColumn.optionValues.push(new OverrideDateColumnOption());
        parentWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, parentColumnSet);

        service.launchSpritelet(parentWidget, spriteletColumnEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toEqual(true);
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeDefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const childColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(childColumns.length).toBe(1);
        expect(childColumns[0].columnKey).toBe('rfv_contrib_port_4');
        expect(childColumns[0].optionValues.find(option => option.configType === OverrideDateColumnOption.CONFIG_TYPE)).toBeUndefined();

        expect(widgetResult.dataStore.metaData.inputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toEqual(true);
        expect((widgetResult.dataStore.metaData.inputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN) as Breakdown).equals(Breakdown.getDefaultFactorBreakdown())).toBe(true);
    });

    it('should not launch factor time series chart from STRING column', () => {
        spriteletColumnEvent.params.column.getColId = () => 'rfv_factor_type_2';
        service.launchSpritelet(parentWidget, spriteletColumnEvent);

        expect(WorkspaceStore.getCurrentReport().widgets).toHaveLength(0);
    });

    it('should not launch factor time series chart on non-aggregatable column', () => {
        spriteletColumnEvent.params.column.getColId = () => 'rfv_factor_lvl_6e83ed2dca37475';
        service.launchSpritelet(parentWidget, spriteletColumnEvent);

        expect(WorkspaceStore.getCurrentReport().widgets).toHaveLength(0);
    });

    it('should  launch factor time series chart for a Return Attribution column', () => {
        spriteletColumnEvent.params.column.getColId = () => 'expsr_contr_df818dd7223949b';
        service.launchSpritelet(parentWidget, spriteletColumnEvent);

        expect(WorkspaceStore.getCurrentReport().widgets).toHaveLength(1);
    });

    it('should launch a factor time series chart from a row', () => {
        service.launchSpritelet(parentWidget, spriteletRowEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBe(true);
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeDefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('expsr_contr_df818dd7223949b');

        expect(widgetResult.dataStore.metaData.inputs.has(FactorPathInput.configType)).toBe(true);
        const factorPathInput = (widgetResult.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput);
        expect(factorPathInput.path).toHaveLength(1);
        expect(factorPathInput.path[0].level).toEqual(ROOT_LEVEL);
        expect(factorPathInput.path[0].value).toEqual('PEP');

        expect(widgetResult.dataStore.metaData.inputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toEqual(true);
        expect((widgetResult.dataStore.metaData.inputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN) as Breakdown).equals(Breakdown.getDefaultFactorBreakdown())).toBe(true);
    });

    it('should launch factor time series chart from a leaf level row node', () => {
        spriteletRowEvent.params.node = {
            field: 'rfv_ftitle',
            key: 'United Kingdom',
            data: {
                rfv_ftitle_123: 'United Kingdom',
                rfv_factor_type_2: 'Country Return',
                rfv_factor_lvl_6e83ed2dca37475: 76.82701796304391,
                rfv_contrib_port_4: -0.19407546497344552,
                rfv_contrib_bench_674: -0.11,
                expsr_contr_24ddaccd47f7452: 0.5270563080991079,
                rfv_block_path: '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR',
                _ROOT_: 'PEP',
                'level-1': 'COUNTRY'
            },
            level: 1,
            group: false,
            parent: {
                field: '_ROOT_',
                key: 'PEP',
                level: 0,
                group: true,
                parent: {
                    field: undefined,
                    key: null,
                    level: -1
                }
            }
        };

        service.launchSpritelet(parentWidget, spriteletRowEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];

        expect(widgetResult.configType).toBe(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);

        expect(widgetResult.dataStore.isDependentOnParentForMetaData).toBe(true);
        expect(widgetResult.dataStore.isDependentOnParentForData).toBeFalsy();
        expect(widgetResult.dataStore.parentDataStore).toBeDefined();

        expect(widgetResult.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (widgetResult.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(1);
        expect(metaDataColumns[0].columnKey).toBe('rfv_contrib_bench_674');

        expect(widgetResult.dataStore.metaData.inputs.has(FactorPathInput.configType)).toBe(true);
        const factorPathInput = (widgetResult.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput);
        expect(factorPathInput.path).toHaveLength(2);
        expect(factorPathInput.path[0].level).toEqual(ROOT_LEVEL);
        expect(factorPathInput.path[0].value).toEqual('PEP');
        expect(factorPathInput.path[1].level).toEqual('rfv_block_path');
        expect(factorPathInput.path[1].value).toEqual('15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR');

        const chartSettings = (widgetResult.dataStore.metaData.inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings);
        expect(chartSettings.includeTotalValues).toEqual(false);

        expect(widgetResult.dataStore.metaData.inputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toEqual(true);
        expect((widgetResult.dataStore.metaData.inputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN) as Breakdown).equals(Breakdown.getDefaultFactorBreakdown())).toBe(true);
    });
});
