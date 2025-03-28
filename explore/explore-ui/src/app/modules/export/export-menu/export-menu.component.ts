import {Component, Input, OnInit} from '@angular/core';
import {
    AuxButtonTypeEnum,
    AuxInlineMenuInterface,
    AuxInlineMenuItemClickedDetailInterface,
    AuxNotificationStyleEnum,
    AuxNotificationToastTypeEnum
} from '@blk/aladdin-angular-components';
import {CommonConstants, ExportConstants, StatusConstants} from '../../../constants';
import {AppStore} from '../../../app.store';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExportUtils} from '@utils/export/export.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ExportHubStore} from '@stores/export-hub.store';
import {ExportHubUtils} from '../../export-hub/utils/export-hub.utils';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {AlertConstants, CommonUtils, CoreWidgetConfigStore} from '@blk/explore-ui-core';
import {cloneDeep, isEmpty, isNil} from 'lodash';
import {NotificationService} from '@services/notification';
import {PORTFOLIOS_RUN_AS_TYPE} from '../../export-hub/constants/export-hub.constants';
import {ApiModelConversionService} from '@services/portfolio-analytics-api/api-model-conversion.service';
import {forkJoin, map, of} from 'rxjs';
import {Widget} from '@models/widget/widget.model';
import {ApiRequestFactory} from '../../../factories/api-request.factory';
import {catchError} from 'rxjs/operators';
import {
    ExportHubJob,
    ExportHubJobPortfolio,
    ExportHubJobWidget
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {Portfolio} from '@models/portfolio/portfolio.model';

/**
 * Component for Export Menu (Export To PDF and Export To Excel)
 *
 * @example
 *  <div slot="header-toolbar" class="widget-header">
 *      <app-export-menu [isIconTrigger]="true" [exportLevel]="exportPDFWidget" [widget?]="widget"></app-export-menu>
 *  </div>
 *
 *  <app-export-menu [exportLevel]="exportLevel"></app-export-menu>
 */
@Component({
    selector: 'app-export-menu',
    templateUrl: './export-menu.component.html'
})

export class ExportMenuComponent implements OnInit {
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    @Input() exportLevel: string;

    @Input() tableData: any;

    @Input() outlineData: any;

    @Input() shouldIncludeBLOOption: boolean;

    /** Export Inline data */
    EXPORT_OPTION: AuxInlineMenuInterface[][];

    /**
     * constructor
     */
    constructor(private appStore: AppStore, private exportHubStore: ExportHubStore, private notificationService: NotificationService, private apiModelConversionService: ApiModelConversionService) {
    }

    /**
     * onInit hook
     */
    ngOnInit() {
        this.EXPORT_OPTION = this.shouldIncludeBLOOption ? cloneDeep(ExportConstants.EXPORT_OPTION_PDF_EXCEL_BLO) : cloneDeep(ExportConstants.EXPORT_OPTION_PDF_EXCEL);
        if (ExportHubUtils.isExportHubEnabled()) {
            this.EXPORT_OPTION[0].push(ExportConstants.SCHEDULE_JOB_OPTION);
        }
    }

    /**
     * Method is triggered when any of menu is clicked/selected
     */
    onMenuItemClicked(event: CustomEvent<AuxInlineMenuItemClickedDetailInterface>) {
        if (event.detail.element.eventData === ExportConstants.EXPORT_OPTION_BLO.label) {
            this.exportBLO();
            return;
        }

        if (event.detail.element.eventData === ExportConstants.SCHEDULE_JOB_OPTION.label) {
            this.validateWidgetsAndAddToScheduledJob();
            return;
        }

        // get appropriate export composite and open the modal according to the export type.
        this.openExportModal(ExportUtils.getExportComposite(event.detail.element.label, this.exportLevel, undefined, undefined, this.tableData, this.outlineData));
    }

    /**
     * Validate widgets for scheduled job and add to export hub job if valid.
     * Validation is done by generatingAPI request for the widget and check for errors.
     */
    validateWidgetsAndAddToScheduledJob(): void {
        const tasks$ = [];
        let errorWidgetMessages : string[] = [];
        let unsupportedWidgets : string[] = [];
        let validWidgets : Widget[] = [];
        const portfolio = WorkspaceStore.getCurrentPortfolio();

        if (isEmpty(WorkspaceStore.getCurrentReport().widgets)) {
            this.notificationService.error('Please add widgets to the report to schedule a job');
            return;
        }

        for (const widget of WorkspaceStore.getCurrentReport().widgets) {
            //Check if PA API supports the widget, if not continue
            if (!ApiRequestFactory.widgetHasApiRequestType(widget.configType)) {
                unsupportedWidgets.push(widget.displayTitle);
                continue;
            }
            // Generate payload for genrateApiRequest and send the request
            const generateApiRequestPayload = this.apiModelConversionService.getGenerateApiRequestPayload(widget, portfolio);
            const apiRequestObservable = this.apiModelConversionService.convertExploreModelToApiModel$(generateApiRequestPayload, StatusConstants.VALIDATING_EXPORT_HUB_JOB)
                .pipe(
                    map(response => {
                        if (!isNil(response.data)) {
                            // All good, widget is valid for scheduled job
                            return widget;
                        }
                    }),
                    catchError((errMsg) => {
                        errMsg.message.replace('Error: ', '');
                        errorWidgetMessages.push(widget.displayTitle + ' widget: ' + errMsg.message);
                        return of(null);
                    })
                );
            // Push the observable to the tasks array
            tasks$.push(apiRequestObservable);
        }

        //Get all the tasks and validate the widgets
        forkJoin(tasks$).subscribe((response: any[]) => {
            validWidgets = response.filter(widget => !isNil(widget));
            this.scheduleJobExport(validWidgets);

            this.handleValidationErrors(validWidgets, errorWidgetMessages, unsupportedWidgets);
        });

        //When all widgets are unsupported we still want to show the error message
        if (isEmpty(tasks$) && !isEmpty(unsupportedWidgets)) {
            this.handleValidationErrors(validWidgets, errorWidgetMessages, unsupportedWidgets);
        }

    }


    /**
     * Handle validation errors
     * @param validWidgets
     * @param errorWidgetMessages
     * @param unsupportedWidgets
     * @private
     */
    private handleValidationErrors(validWidgets: any[], errorWidgetMessages:string[], unsupportedWidgets?: string[]): void {
        if(!isEmpty(unsupportedWidgets)){
            errorWidgetMessages.push(AlertConstants.NOTIFICATION.UNSUPPORTED_WIDGETS_FOR_EXPORT + unsupportedWidgets.join(CommonConstants.COMMA_WITH_SPACE));
        }

        if ( !isEmpty(errorWidgetMessages)) {
            let detailedNotification = {
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Error',
                id: CommonUtils.generateUniqueIdAsString(),
                message: errorWidgetMessages,
                notificationStyle: AuxNotificationStyleEnum.ERROR
            };

            if (validWidgets.length !== 0) {
                detailedNotification.header = 'Warning';
                detailedNotification.notificationStyle = AuxNotificationStyleEnum.WARNING;
            }

            this.notificationService.detailedMessage(detailedNotification);

        }
    }

    scheduleJobExport(widgets: Widget[]) {
        if (isEmpty(widgets)) {
            return;
        }
        const scheduledJob = new ExportHubJob();
        const jobPortfolioConfig = new ExportHubJobPortfolio();
        const portfolio = WorkspaceStore.getCurrentPortfolio();

        if(!this.arePortfolioAndBenchmarkValid(portfolio)){
            return;
        }

        jobPortfolioConfig.setJobPortfolioName(portfolio.portName);
        jobPortfolioConfig.setJobPortfolioCode(portfolio.portCode);
        jobPortfolioConfig.setRunAsType(PORTFOLIOS_RUN_AS_TYPE);
        jobPortfolioConfig.setPortfolioSetting(PortfolioUtils.encodePortfolio(portfolio));
        scheduledJob.addJobPortfolios(jobPortfolioConfig);

        const errorMessages: string[] = [];
        const jobList: ExportHubJobWidget[] = [];
        for (const widget of widgets) {
            const exportHubWidget = new ExportHubJobWidget();
            exportHubWidget.setTitle(widget.displayTitle);
            exportHubWidget.setWidgetType(CoreWidgetConfigStore.getChartConfigForType(widget.configType).title);
            try {
                exportHubWidget.setWidgetSetting(ExportHubUtils.encodeWidgetSettingsForScheduledJob(widget));
            } catch (e) {
                errorMessages.push(widget.displayTitle + ': ' + e.message);
                continue;
            }
            jobList.push(exportHubWidget);
        }
        scheduledJob.setJobWidgetsList(jobList);
        if (!!errorMessages.length) {
            this.notificationService.detailedMessage({
                toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                header: 'Error',
                id: CommonUtils.generateUniqueIdAsString(),
                message: errorMessages,
                notificationStyle: AuxNotificationStyleEnum.ERROR
            });
        }
        if (!jobList?.length) {
            return;
        }

        this.exportHubStore.openScheduleJobModal(scheduledJob);
    }

    /**
     * Method is triggered when Export link is clicked
     */
    onExportClick(): boolean {
        return false; // This is to prevent the redirection to home page on link click
    }

    /**
     * Open export modal
     */
    private openExportModal(exportComposite: ExportComposite): void {
        this.appStore.openExportOptionsModal$.next(exportComposite);
    }

    /**
     * Export in BLO format
     */
    exportBLO(): void {
        // initiate the csv with header
        let csv = [ExportConstants.ALADDIN_SEC_ID, ExportConstants.ORDER_QTY, ExportConstants.ORDER_TRAN_TYPE, CommonConstants.PORTFOLIO.toUpperCase()].join() + '\n';
        // For each trade add details to the csv
        this.tableData.children.forEach((node) => {
            csv += [node.data[0], Math.abs(node.data[4]), (node.data[2] as string).toUpperCase(), (WorkspaceStore.getCurrentPortfolio() as WhatIfPortfolio)?.parentPortfolio.portName].join() + '\n';
        });
        ExportUtils.download(csv, ExportConstants.BLO_FORMAT_TRADES, 'text/csv', undefined, false, false);
    }

    /**
     * Check if the portfolio and benchmark are valid for scheduled job
     * @param portfolio
     * @private
     */
    private arePortfolioAndBenchmarkValid(portfolio: Portfolio) {
        if (portfolio instanceof WhatIfPortfolio || portfolio.benchmark?.portfolio instanceof WhatIfPortfolio) {
            this.notificationService.error('What-If portfolios and benchmarks are not supported for scheduled jobs');
            return false;
        }
        return true;
    }
}
