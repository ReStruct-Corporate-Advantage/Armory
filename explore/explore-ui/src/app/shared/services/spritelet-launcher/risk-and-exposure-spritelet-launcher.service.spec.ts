import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {Widget} from '@models/widget/widget.model';
import {Observable, of, throwError} from 'rxjs';
import {
    RiskAndExposureSpriteletLauncherService
} from '@services/spritelet-launcher/risk-and-exposure-spritelet-launcher.service';
import {MandateMappingService} from '@services/mandate/mandate-mapping.service';
import {WidgetConstants} from '@constants/widget.constants';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {
    AbstractConfig,
    ColumnConfig,
    ColumnConstants,
    UseType,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {
    PortfolioSecuritiesHandlerService
} from '../../../modules/main/composition-modelling/services/portfolio-securities-handler.service';
import {RowNode} from 'ag-grid-community';
import {ExportService} from '@services/export/export.service';
import {CashflowDownloadSettings} from '@models/widget/inputs/cashflow-download-settings.model';
import {RiskSettings} from '@blk/explore-ui-risk';
import {NotificationService} from '@services/notification';

/**
 * Test cases for RiskAndExposureSpriteletLauncherServicelaunchSpritelet
 */
describe('RiskAndExposureSpriteletLauncherService', () => {
    let service: RiskAndExposureSpriteletLauncherService;
    const mandateMappingServiceStub = {
        setWidgetDefaultsAsPerMandate: jest.fn((): Observable<AbstractConfig>[] => {
            return [];
        })
    };

    const portSecuritiesHandlerServiceStub = {
        getPortData$: jest.fn((): Observable<any>[] => {
            return [];
        })
    };
    const longCommaSeparatedPortfolioName = {
        currency: 'USD',
        cusip: '',
        fullName: 'TR-MULTI, TR-MARKET, CORE_PLUS, UNIVERSAL, GOVCORP, MHYO, EMI, AEGON, TR-INT-AGG, TR-INT-GC, MULT-OTHER, TR-MLTTRN',
        id: undefined,
        isBench: false,
        isCompositePortfolio: false,
        isIndexResearchPortfolio: undefined,
        isPortfolioGroup: true,
        isPortfolioModellingAllowed: true,
        isSectorModellingAllowed: true,
        isSecurityModellingAllowed: true,
        portName: 'TR-MULTI, TR-MARKET, CORE_PLUS, UNIVERSAL, GOVCORP, MHYO, EMI, AEGON, TR-INT-AGG, TR-INT-GC, MULT-OTHER, TR-MLTTRN',
        title: 'TR-MULTI, TR-MARKET, CORE_PLUS, UNIVERSAL, GOVCORP, MHYO, EMI, AEGON, TR-INT-AGG, TR-INT-GC, MULT-OTHER, TR-MLTTRN'
    };

    const testLaunchSpritelet = async (done, params) => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        jest.spyOn(mandateMappingServiceStub, 'setWidgetDefaultsAsPerMandate');
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.PGS);
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params);
        service.launchSpritelet(widget, spriteletEvent);
        expect(mandateMappingServiceStub.setWidgetDefaultsAsPerMandate).toHaveBeenCalled();
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RISK_EXPOSURE);
        expect(spriteletWidget.dimensions.cols).toBe(8);
        expect(spriteletWidget.dimensions.rows).toBe(6);
        expect(spriteletWidget.dimensions.x).toBe(8);
        expect(spriteletWidget.dimensions.y).toBe(null);
        expect(spriteletWidget.showSettings).toBe(false);
        const portfolioOverrideInput = spriteletWidget.dataStore.metaData.inputs.get('portfolioOverrideInput') as PortfolioOverrideInput;
        expect(portfolioOverrideInput.portfolio).toBe('FFH-FIT');
    };

    const exportServiceMock = {
        exportFile: jest.fn()
    };

    const notificationServiceStub = {
        error: jest.fn(),
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: MandateMappingService, useValue: mandateMappingServiceStub},
                {provide: PortfolioSecuritiesHandlerService, useValue: portSecuritiesHandlerServiceStub},
                {provide: ExportService, useValue : exportServiceMock},
                {provide: NotificationService, useValue: notificationServiceStub},
            ]
        });
        service = TestBed.inject(RiskAndExposureSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY);
    });

    it('test launchSpritelet', done => {
        testLaunchSpritelet(done, {
            node: {
                'parent': {
                    'group': true,
                    'key': 'CORE-HQ',
                },
                'group': false,
                'data': {
                    'portfolio': 'FFH-FIT'
                }
            },
            value: 'FFH-FIT',
            column: {getColId: () => 'portfolio', getColDef: () => ({field: 'portfolio'})}
        });
    });

    it('test launchSpritelet - long name options scenario', (done)  => {
        testLaunchSpritelet(done, {
            node: {
                'parent': {
                    'group': true,
                    'key': 'CORE-HQ',
                },
                'group': false,
                'data': {
                    'portfolio': 'Full name for FFH-FIT',
                    [ColumnConstants.PORTFOLIO_HIDDEN]: 'FFH-FIT'
                }
            },
            value: 'FFH-FIT',
            column: {getColId: () => 'portfolio', getColDef: () => ({field: 'portfolio'})}
        });
    });

    it('test launchSpritelet - intermediate nodes which do not have portfolio column populated', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        jest.spyOn(mandateMappingServiceStub, 'setWidgetDefaultsAsPerMandate');
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.PGS);
        const params: any = {
            node: {
                'parent': {
                    'group': true,
                    'key': 'TR-MULTI',
                },
                'group': true,
                'data': {
                    'portfolio': null,
                    'level-1': 'TR-MULTI'
                }
            },
            value: 'TR-MARKET',
            column: {getColId: () => 'portfolio', getColDef: () => ({field: 'portfolio'})}
        };
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params);
        service.launchSpritelet(widget, spriteletEvent);
        expect(mandateMappingServiceStub.setWidgetDefaultsAsPerMandate).toHaveBeenCalled();
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RISK_EXPOSURE);
        expect(spriteletWidget.dimensions.cols).toBe(8);
        expect(spriteletWidget.dimensions.rows).toBe(6);
        expect(spriteletWidget.dimensions.x).toBe(8);
        expect(spriteletWidget.dimensions.y).toBe(null);
        expect(spriteletWidget.showSettings).toBe(false);
        const portfolioOverrideInput = spriteletWidget.dataStore.metaData.inputs.get('portfolioOverrideInput') as PortfolioOverrideInput;
        expect(portfolioOverrideInput.portfolio).toBe('TR-MARKET');
    });

    it('test launchSpritelet - comma separated portfolio list sets portName using currentPortfolio', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        jest.spyOn(mandateMappingServiceStub, 'setWidgetDefaultsAsPerMandate');
        const report = WorkspaceStore.getCurrentReport();
        const currentPortfolio = longCommaSeparatedPortfolioName;
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.PGS);
        const params: any = {
            node: {
                'parent': {
                    'group': true,
                    'key': 'TR-MULTI, TR-MARKET...',
                },
                'group': true,
                'data': {}
            },
            value: 'TR-MULTI, TR-MARKET...',
            column: {getColId: () => 'portfolio', getColDef: () => ({field: 'portfolio'})}
        };
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params);
        service.launchSpritelet(widget, spriteletEvent);

        expect(mandateMappingServiceStub.setWidgetDefaultsAsPerMandate).toHaveBeenCalled();
        let portName: string;

        if (!isEmpty(params.node.data[ColumnConstants.PORTFOLIO_HIDDEN])) {
            portName = params.node.data[ColumnConstants.PORTFOLIO_HIDDEN];
            expect(portName).toBe('portfolio_hidden');
        } else {
            const portNameCol = (widget.dataStore.metaData.inputs.get('columns') as ColumnSet).getColumnBasedOnColTagAndUse(ColumnConstants.PORTFOLIO, UseType.ALL);
            portName = params.node.data[portNameCol.columnKey] ? params.node.data[portNameCol.columnKey] : currentPortfolio.portName;
            expect(portName).toBe('TR-MULTI, TR-MARKET, CORE_PLUS, UNIVERSAL, GOVCORP, MHYO, EMI, AEGON, TR-INT-AGG, TR-INT-GC, MULT-OTHER, TR-MLTTRN');
        }
    });

    it('test launchSpritelet - active shares', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        jest.spyOn(mandateMappingServiceStub, 'setWidgetDefaultsAsPerMandate');
        jest.spyOn(portSecuritiesHandlerServiceStub, 'getPortData$');
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.PGS);
        const columnSet = new ColumnSet();
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.PORTFOLIO, UseType.ALL, ColumnConstants.PORTFOLIO));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.COLUMN_TAG.CUSIP, UseType.ALL, ColumnConstants.COLUMN_TAG.CUSIP));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.ACTIVE_SHARES, UseType.ALL, ColumnConstants.ACTIVE_SHARES));
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
        const params: any = {
            node: {
                'parent': {
                    'group': true,
                    'key': 'TR-MULTI',
                },
                'group': true,
                'data': {
                    'portfolio': null,
                }
            },
            value: 'TR-MARKET',
            column: {getColId: () => 'portfolio', getColDef: () => ({field: 'portfolio'})}
        };
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params, null, WidgetConstants.ACTIVE_SHARES_SPRITELET.ACTION_NAME);
        service.launchSpritelet(widget, spriteletEvent);
        expect(portSecuritiesHandlerServiceStub.getPortData$).toHaveBeenCalled();

        // For top level click
        const node1 = new RowNode();
        node1.field = 'level-1';
        node1.key = 'RUB-RO';
        node1.level = 1;
        node1.__hasChildren = false;
        node1.group = true;
        node1.data = {
            'rowId': 171,
            'bgColorMap': {},
            'nav_group_0': 97400.32916294973,
            'pct_nav_group_1': 0.9119433675840956,
            '_ROOT_': 'RUBICONAGA',
            'portfolio': 'RUB-RO'
        };
        const node = new RowNode();
        node.field = 'level-0';
        node.key = 'RUBICONAGA';
        node.level = 0;
        node.group = true;
        node.data = {
            'rowId': 171,
            'bgColorMap': {},
            'nav_group_0': 97400.32916294973,
            'pct_nav_group_1': 0.9119433675840956,
            '_ROOT_': 'RUBICONAGA'
        };
        node1.parent = node;
        params.node = node;
        params.column = {getColId: () => 'actionCol', getColDef: () => ({field: 'actionCol'})};
        service.launchSpritelet(widget, spriteletEvent);
        expect(portSecuritiesHandlerServiceStub.getPortData$).toHaveBeenCalled();

        // For level 1 click
        params.node = node1;
        service.launchSpritelet(widget, spriteletEvent);
        expect(portSecuritiesHandlerServiceStub.getPortData$).toHaveBeenCalled();
    });

    it('test resolveRequestedPortForNonActionCol', () => {
        let params: any = {
            node: {
                'data': {
                    'portfolio': ''
                },
                'key': 'FFH-FIT'
            },
        };
        const portNameCol = new ColumnConfig();
        portNameCol.columnKey = 'portfolio';
        expect(service['resolveRequestedPortForNonActionCol'](params as any, portNameCol, null)).toBe('FFH-FIT');

        // key no referred - leaf node
        params = {
            node: {
                'data': {
                    'portfolio': 'FFH-FIT'
                }
            }
        };
        portNameCol.columnKey = 'portfolio';
        expect(service['resolveRequestedPortForNonActionCol'](params as any, portNameCol, null)).toBe('FFH-FIT');
    });

    it('test launchSpritelet - cashflows download', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget.dataStore.metaData.inputs.set(RiskSettings.CONFIG_TYPE, new RiskSettings());
        const params: any = {
            value: 'TR-MARKET',
            column: {getColId: () => 'portfolio', getColDef: () => ({field: 'portfolio'})}
        };
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params, undefined, WidgetConstants.DOWNLOAD_CASHFLOW_SPRITELET.ACTION_TYPE);

        const errorSpy = jest.spyOn(service['notificationService'], 'error');

        let spy = jest.spyOn(service['exportService'], 'exportFile').mockImplementationOnce(exportComposite => {
            expect(exportComposite.widget.dataStore.metaData.inputs.get(CashflowDownloadSettings.configType) as CashflowDownloadSettings).toBeTruthy();
            return of(true);
        });

        service.launchSpritelet(widget, spriteletEvent);

        expect(spy).toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();

        spy = jest.spyOn(service['exportService'], 'exportFile').mockImplementationOnce(_exportComposite => throwError(() => ''));

        service.launchSpritelet(widget, spriteletEvent);

        expect(spy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalled();

    });

    it('test export method updateExportingStatus', () => {
        expect(service['appStore']).toBeDefined();
        service['updateExportingStatus'](true);
        expect(service['appStore'].exportDownloadingStatus$.value).toStrictEqual({downloadInProgress: false, exportComposite: undefined});
        service['updateExportingStatus'](false);
        expect(service['appStore'].exportDownloadingStatus$.value).toStrictEqual({downloadInProgress: true, exportComposite: undefined});
    });
});
