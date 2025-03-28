import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {Widget} from '@models/widget/widget.model';
import {WidgetConstants} from '@constants/widget.constants';
import {
    ColumnConfig,
    CoreDefinitionStore,
    TokenConstants,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {CommitmentRiskSpritletLauncherService} from '@services/spritelet-launcher/commitment-risk-spritlet-launcher.service';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';

/**
 * Test cases for CommitmentRiskSpritletLauncherService
 */
describe('CommitmentRiskSpritletLauncherService', () => {
    let service: CommitmentRiskSpritletLauncherService;
    beforeAll(() => {
        TestBed.configureTestingModule({
        });
        service = TestBed.inject(CommitmentRiskSpritletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(WidgetConstants.COMMITMENT_RISK_SPRITELET.ACTION_KEY);
    });

    it('test launchSpritelet - ACRM 2', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'N';
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK] = 'Y';
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const columns = [];
        columns.push(ColumnConfig.createColumn('cusip', 'positionColumnType', 'cusip_0', 'Cusip'));
        columns.push(ColumnConfig.createColumn('security_description', 'positionColumnType', 'security_description_1', 'Description'));
        const columnSet = new ColumnSet();
        columnSet.columns = columns;
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
        const params: any = {
            node: {
                'group': false,
                'data': {
                    'cusip_0': 'CUSIP 1',
                    'security_description_1': 'SEC DESCRIPTION'
                }
            }
        };
        const spriteletEvent = new SpriteletEvent(WidgetConstants.COMMITMENT_RISK_SPRITELET.ACTION_KEY, params);
        service.launchSpritelet(widget, spriteletEvent);
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.COMMITMENT_RISK_CHART);
        const fundCusip = spriteletWidget.dataStore.metaData.inputs.get(WidgetInputType.FUND_CUSIP) as FundCusip;
        expect(fundCusip.cusip).toBe('CUSIP 1');
    });

    it('test launchSpritelet - legacy', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK] = 'N';
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const columns = [];
        columns.push(ColumnConfig.createColumn('cusip', 'positionColumnType', 'cusip_0', 'Cusip'));
        columns.push(ColumnConfig.createColumn('security_description', 'positionColumnType', 'security_description_1', 'Description'));
        const columnSet = new ColumnSet();
        columnSet.columns = columns;
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
        const params: any = {
            node: {
                'group': false,
                'data': {
                    'cusip_0': 'CUSIP 1',
                    'security_description_1': 'SEC DESCRIPTION'
                }
            }
        };
        const spriteletEvent = new SpriteletEvent(WidgetConstants.COMMITMENT_RISK_SPRITELET.ACTION_KEY, params);
        service.launchSpritelet(widget, spriteletEvent);
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
        const fundCusip = spriteletWidget.dataStore.metaData.inputs.get(WidgetInputType.FUND_CUSIP) as FundCusip;
        expect(fundCusip.cusip).toBe('CUSIP 1');
    });

});
