import {TestBed} from '@angular/core/testing';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnConfig, PerformanceSettings, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {FactorBlockInput} from '@models/widget/inputs/factor-block-input.model';
import {MinValFilter} from '@models/widget/inputs/min-val-filter.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';

import {SecurityContributionLauncherService} from './security-contribution-launcher.service';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';

describe('SecurityContributionLauncherService', () => {
    let service: SecurityContributionLauncherService;

    let widget: Widget;
    let spriteletRowEvent;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        TestBed.configureTestingModule({});
        service = TestBed.inject(SecurityContributionLauncherService);

        widget = new Widget(WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION);

        const metaData = new WidgetDataStoreMetaData();
        const columnSet = new ColumnSet({
            columns: [
                ColumnConfig.createColumn('rfv_ftitle', 'ALL', 'rfv_ftitle', ' Title'),
                ColumnConfig.createColumn('rfv_factor_type', 'ALL', 'rfv_factor_type_2', 'Factor Type'),
                ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5', 'Factor Vol'),
                ColumnConfig.createColumn('rfv_contrib_port', 'PORT', 'rfv_contrib_port_4', 'Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_bench', 'BENCH', 'rfv_contrib_bench_674', 'Benchmark Risk Contribution'),
                ColumnConfig.createColumn('rfv_contrib_active', 'ACTIVE', 'rfv_contrib_active_645', 'Active Risk Contribution')
            ]
        });
        metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
        metaData.inputs.set(RiskSettings.CONFIG_TYPE, new RiskSettings());
        metaData.inputs.set(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, new Breakdown());
        metaData.inputs.set(MinValFilter.CONFIG_TYPE, new MinValFilter());

        const dataStore = new WidgetDataStore();
        dataStore.metaData = metaData;
        dataStore.data = {
            widgetConfigType: WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION
        };
        widget.dataStore = dataStore;

        spriteletRowEvent = {
            params: {
                node: {
                    field: 'level-1',
                    key: 'COUNTRY',
                    level: 1,
                    group: true,
                    parent: {
                        field: '_ROOT_',
                        key: 'PEP',
                        level: 0
                    },
                    data: {
                        rfv_block_path: '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY'
                    }
                },
                value: 'COUNTRY'
            }
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe('OPEN_SECURITY_CONTRIBUTION');
    });

    it('should create security contribution widget and copy parent meta', () => {
        service.launchSpritelet(widget, spriteletRowEvent);
        const spriteletWidget = WorkspaceStore.getCurrentReport().widgets[0];

        expect(spriteletWidget.configType).toBe(WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION);
        expect(spriteletWidget.showSettings).toBe(false);
        expect(spriteletWidget.title).toBe('Security contribution to COUNTRY');

        expect(spriteletWidget.dataStore.isDependentOnParentForMetaData).toBe(true);

        expect(spriteletWidget.dataStore.metaData.inputs.has(WidgetInputType.COLUMNS)).toBe(true);
        const metaDataColumns = (spriteletWidget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns;
        expect(metaDataColumns.length).toBe(6);

        expect(spriteletWidget.dataStore.metaData.inputs.has(FactorBlockInput.configType)).toBe(true);
        const factorBlockInput = (spriteletWidget.dataStore.metaData.inputs.get(FactorBlockInput.configType) as FactorBlockInput);
        expect(factorBlockInput.isBlock).toBe(true);
        expect(factorBlockInput.blockPath).toBe('779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY');

        expect(spriteletWidget.dataStore.metaData.inputs.has(RiskSettings.CONFIG_TYPE)).toBe(true);
        expect(spriteletWidget.dataStore.metaData.inputs.has(PerformanceSettings.CONFIG_TYPE)).toBe(false);
        expect(spriteletWidget.dataStore.metaData.inputs.has(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN)).toBe(true);
        expect(spriteletWidget.dataStore.metaData.inputs.has(MinValFilter.CONFIG_TYPE)).toBe(false);
    });

    it('Test getWidgetTitle', () => {
        const event = {
            params: {
                node: {
                    field: 'level-1',
                    key: 'COUNTRY',
                    level: 1,
                    group: true,
                    parent: {
                        field: '_ROOT_',
                        key: 'PEP',
                        level: 0
                    },
                    data: {
                        rfv_block_path: '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY',
                    }
                },
                value: 'COUNTRY'
            }
        };
        expect(service['getWidgetTitle'](widget, event as SpriteletEvent)).toBe('Security contribution to COUNTRY');
        event.params.node.data['rfv_ftitle'] = 'CASH';
        event.params.node.group = false;
        expect(service['getWidgetTitle'](widget, event as SpriteletEvent)).toBe('Security contribution to CASH');
    });
});
