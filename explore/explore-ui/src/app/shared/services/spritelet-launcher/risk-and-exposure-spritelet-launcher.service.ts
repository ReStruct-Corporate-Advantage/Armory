import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WidgetConstants} from '@constants/widget.constants';
import {PortfolioStore, WorkspaceStore} from '../../../stores';
import {MandateMappingService} from '@services/mandate/mandate-mapping.service';
import {forkJoin, of} from 'rxjs';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {Injectable} from '@angular/core';
import {GetContextMenuItemsParams} from 'ag-grid-community';
import {ColumnConfig, CoreColumnUtils, ErrorTypeConstants, UIErrorParameters, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ActiveSharesSpriteletUtils} from '@services/spritelet-launcher/active-shares-spritelet.utils';
import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';
import {PortfolioSecuritiesHandlerService} from '../../../modules/main/composition-modelling/services/portfolio-securities-handler.service';
import {ExportService} from '@services/export/export.service';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExportConstants} from '@constants/export.constants';
import {ExportUtils} from '@utils/export/export.utils';
import {WorkspaceMenuItemsConstants} from '@constants/workspace-menu-items.constants';
import {NotificationService} from '@services/notification';
import {AppStore} from '../../../app.store';
import {cloneDeep, isNil} from 'lodash';
import {CashflowDownloadSettings} from '@models/widget/inputs/cashflow-download-settings.model';
import {RiskSettings} from '@blk/explore-ui-risk';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Spritelet launcher responsible for launching a Risk and Exposure from a PGS widget
 */
@Injectable({
    providedIn: 'root'
})
export class RiskAndExposureSpriteletLauncherService extends AbstractSpriteletLauncherService {

    /**
     * constructor
     */
    constructor(private mandateMappingService: MandateMappingService, private notificationService: NotificationService,
                private appStore: AppStore, private exportService: ExportService, private portSecuritiesHandlerService?: PortfolioSecuritiesHandlerService) {
        super();
    }

    /**
     * Method invoked to launch a spritelet
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent): void {
        const report = WorkspaceStore.getCurrentReport();
        const currentPortfolio = WorkspaceStore.getCurrentPortfolio();
        const params = event.params as GetContextMenuItemsParams;

        // cash flow download
        if (event.actionType === WidgetConstants.DOWNLOAD_CASHFLOW_SPRITELET.ACTION_TYPE) {
            this.downloadCashFlows(widget, event);
            return;
        }

        const spriteletWidget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        spriteletWidget.showSettings = false;

        const requestedPort = this.resolveRequestedPort(params, currentPortfolio, widget);

        let observableQueue = [];
        // check if the current widget is PGS, and it contains active_shares column
        const isActiveSharesSpritelet = widget.configType === WidgetConfigType.PGS && event.actionType === WidgetConstants.ACTIVE_SHARES_SPRITELET.ACTION_NAME;
        if (isActiveSharesSpritelet) {
            // check if the requested portfolio exists in cache
            const mainPortCacheKey: PortfolioCacheKey = new PortfolioCacheKey(requestedPort.toUpperCase(), currentPortfolio?.datePicker?.date, false, true);
            const mainPortInfoObject: any = PortfolioStore.getPortfolioInfoFromCache(mainPortCacheKey);
            // if requested portfolio not found in cache then get the requested portfolio and update cache which will be used while fetching data for active_shares spritelet
            if (!mainPortInfoObject) {
                observableQueue.push(this.portSecuritiesHandlerService.getPortData$(mainPortInfoObject, mainPortCacheKey, requestedPort, currentPortfolio?.datePicker?.date, null, null, true));
            }
            ActiveSharesSpriteletUtils.updateInputsForActiveSharesSpritelet(spriteletWidget);
        } else {
            observableQueue = this.mandateMappingService.setWidgetDefaultsAsPerMandate(spriteletWidget);
        }
        if (observableQueue.length === 0) {
            observableQueue.push(of(null));
        }
        forkJoin(observableQueue).subscribe(() => {
            spriteletWidget.dataStore.metaData.inputs.set(PortfolioOverrideInput.PORTFOLIO_OVERRIDE_INPUT, new PortfolioOverrideInput({portfolio: requestedPort, shortName: '', updateBenchAndCurrency: isActiveSharesSpritelet}));
            this.addSpriteletWidgetToReport(widget, spriteletWidget, report);
            WorkspaceStore.currentReport$.next(report);
        });
    }

    private downloadCashFlows(widget: Widget, _event: SpriteletEvent): void {
        const copyWidget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        copyWidget.dataStore.metaData.inputs = new Map();
        const widgetRiskSettings = widget.dataStore.metaData.inputs.get(RiskSettings.CONFIG_TYPE);
        if (widgetRiskSettings) {
            copyWidget.dataStore.metaData.inputs.set(RiskSettings.CONFIG_TYPE, cloneDeep(widgetRiskSettings));
        }

        const cashFlowDownloadSettings = new CashflowDownloadSettings();
        cashFlowDownloadSettings.cashFlowDownload = true;
        copyWidget.dataStore.metaData.inputs.set(CashflowDownloadSettings.configType, cashFlowDownloadSettings);

        copyWidget.title = cashFlowDownloadSettings.cashFlowFileTitle;


        const columnSet = new ColumnSet();

        [ ...cashFlowDownloadSettings.visibleColumns, ...cashFlowDownloadSettings.hiddenColumns]
            .map(colTag => CoreColumnUtils.getColumnDefByTag(colTag))
            .filter(colDef => !isNil(colDef))
            .forEach(colDef => {
                const col: any = ColumnConfig.createColumnFromColumnDefinition(colDef);
                columnSet.columns.push(col);
            });


        copyWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);

        const exportComposite = ExportUtils.getExportComposite(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL, ExportConstants.EXPORT_WIDGET, copyWidget);

        this.updateExportingStatus(false, exportComposite);

        this.exportService.exportFile(exportComposite).subscribe({
            next: downloadCompleted => this.updateExportingStatus(downloadCompleted, exportComposite),
            error: _err => {
                // Update the export status so the spinner stops
                this.updateExportingStatus(true);
                this.notificationService.error(ExportUtils.getExportType(exportComposite) + ' failed to export.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_EXPORT_ITEM_CLICKED_ERROR);
            }
        });
    }

    /**
     * Updates Exporting Status
     */
    private updateExportingStatus(downloadCompleted: boolean, exportComposite?: ExportComposite): void {
        this.appStore.updateExportDownloadingStatus(!downloadCompleted, exportComposite);
    }


    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY;
    }
}
