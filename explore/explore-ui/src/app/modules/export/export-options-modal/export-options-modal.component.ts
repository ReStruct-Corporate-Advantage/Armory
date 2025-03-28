import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonConstants, ExportConstants, ExportLevel, UserPreference} from '../../../constants';
import {ExportService} from '@services/export/export.service';
import {UserMetaDataStore} from '../../../stores';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {isNil} from 'lodash';
import {ChartUtils} from '@utils/chart.utils';
import {Widget} from '@models/widget/widget.model';
import {AppStore} from '../../../app.store';
import {NextObserver} from 'rxjs';
import {ExportConfig} from '@interfaces/export-config.interface';
import {
    ExportType,
    TelemetryActionConstants,
    TelemetryService,
    TelemetryTradeTableExportParameters,
    TelemetryExportPDFRequestParameters,
    TelemetryExportExcelRequestParameters,
    ErrorTypeConstants, UIErrorParameters, AlertConstants
} from '@blk/explore-ui-core';
import {NotificationService} from '@services/notification';
import {ExportUtils} from '@utils/export/export.utils';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageMargin} from '@models/export/pdf-page-margin.model';
import {PDFLogoPosition} from '@enums/export/pdf-logo-position.enum';
import {PDFExportOrientation} from '@enums/export/pdf-export-orientation.enum';
import {TablePDFScaling} from '@enums/export/table-pdf-scaling.enum';
import {ExcelExportOutlineStyle} from '@enums/export/excel-export-outline-style.enum';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';

/**
 * Component for the export Options modal
 *
 * @example
 *  <ng-container *ngIf="isExportOptionsModalOpen">
 *      <app-export-options-modal [exportComposite]="exportComposite"
 *                                [isOpen]="isExportOptionsModalOpen"
 *                                (modalClosed)="closeExportOptionsModal()">
 *      </app-export-options-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-export-options-modal',
    templateUrl: './export-options-modal.component.html',
    styleUrls: ['./export-options-modal.component.scss']
})
export class ExportOptionsModalComponent implements OnInit {
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter<boolean>();
    @Input() isOpen: boolean;
    @Input() exportComposite: ExportComposite;
    downloadInProgress = false;

    exportHeader = ExportConstants.EXPORT_OPTIONS;
    readonly OK_TEXT = CommonConstants.BUTTON_TEXT.OK;
    readonly CANCEL_TEXT = CommonConstants.BUTTON_TEXT.CANCEL;

    constructor(private exportService: ExportService, private appStore: AppStore, private notificationService: NotificationService) {
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.exportHeader = this.exportComposite.exportConfig.getExportType() + ' ' + this.exportHeader;

        // Modify export config as per user's export settings
        this.exportComposite.exportConfig = this.exportComposite.exportConfig instanceof ExcelExportConfig ? this.initializeExcelExportConfigFromDefaultValues(UserMetaDataStore.getPreferenceValue(UserPreference.EXPORT_EXCEL), this.exportComposite.exportConfig)
                          : this.initializePDFExportConfigFromDefaultValues(UserMetaDataStore.getPreferenceValue(UserPreference.EXPORT_PDF), this.exportComposite.exportConfig as PDFExportConfig, this.exportComposite.widget);
    }

    /**
     * Returns new Excel export config as per user's Default Excel export config
     */
    initializeExcelExportConfigFromDefaultValues(defaultExcelSettings: string, exportConfig: ExcelExportConfig): ExcelExportConfig {
        // If we don't have user's default settings, return existing export config
        if (isNil(defaultExcelSettings)) {
            return exportConfig;
        }

        const newExportConfig = exportConfig instanceof WorkpadExcelExportConfig ? new WorkpadExcelExportConfig(JSON.parse(defaultExcelSettings)) : new ExcelExportConfig(JSON.parse(defaultExcelSettings));
        // we want to retain export level
        newExportConfig.exportLevel = exportConfig.exportLevel;
        if (newExportConfig.exportLevel === ExportLevel.GRID) {
            // For Simple Table set default config values for options we don't show in the modal
            this.initializeHiddenOptions(newExportConfig);
        }
        return newExportConfig;
    }

    /**
     * Returns new PDF export config as per user's Default PDF export config
     */
    initializePDFExportConfigFromDefaultValues(defaultPDFSettings: string, exportConfig: PDFExportConfig, widget: Widget): PDFExportConfig {
        // If we don't have user's default settings, return existing export config
        if (isNil(defaultPDFSettings)) {
            return exportConfig;
        }

        // Create TablePDFExportConfig only for table widgets and tables other than widgets
        const newExportConfig = ((exportConfig.exportLevel === ExportLevel.WIDGET && !(!isNil(widget) && ChartUtils.isChartWidget(widget))) || exportConfig.exportLevel === ExportLevel.GRID) ? new TablePDFExportConfig(JSON.parse(defaultPDFSettings)) : new PDFExportConfig(JSON.parse(defaultPDFSettings));
        // we want to retain export level
        newExportConfig.exportLevel = exportConfig.exportLevel;
        // Set Default Layout for Widgets
        if (newExportConfig.exportLevel === ExportLevel.WIDGET) {
            newExportConfig.layout = PDFPageLayout.W1X1;
        }
        // Set printAsIs option true for chart widgets
        if (!isNil(widget) && ChartUtils.isChartWidget(widget)) {
            newExportConfig.printAsIs = true;
        }
        if (newExportConfig.exportLevel === ExportLevel.GRID) {
            // For Simple Table set default config values for options we don't show in the modal
            this.initializeHiddenOptions(newExportConfig);
        }
        return newExportConfig;
    }

    /**
     * Initialize options for export not shown in trades export panel
     */
    initializeHiddenOptions(newExportConfig: ExportConfig): void {
        if (newExportConfig instanceof ExcelExportConfig) {
            const defaultExcelConfig = new ExcelExportConfig();
            newExportConfig.fullyExpanded = defaultExcelConfig.fullyExpanded;
            newExportConfig.visibleOnly = defaultExcelConfig.visibleOnly;
            newExportConfig.freezeColumnHeaders = defaultExcelConfig.freezeColumnHeaders;
            newExportConfig.exportToSingleSheet = defaultExcelConfig.exportToSingleSheet;
            newExportConfig.isFilterFriendly = defaultExcelConfig.isFilterFriendly;
            newExportConfig.isGroupingEnabled = defaultExcelConfig.isGroupingEnabled;
        } else {
            const defaultTablePDFConfig = new TablePDFExportConfig();
            (newExportConfig as TablePDFExportConfig).fullyExpanded = defaultTablePDFConfig.fullyExpanded;
            (newExportConfig as TablePDFExportConfig).visibleOnly = defaultTablePDFConfig.visibleOnly;
            (newExportConfig as TablePDFExportConfig).customLevel = defaultTablePDFConfig.customLevel;
            (newExportConfig as TablePDFExportConfig).customLevelDepth = defaultTablePDFConfig.customLevelDepth;
        }
    }

    /**
     * Close modal
     */
    closeModal(applyChange?: boolean): void {
        this.isOpen = false;
        // for report groups that have pgs chart widgets, we want to notify the user that some charts may not get exported correctly
        this.validatePgsChartReportGroup();
        if (applyChange) {
            this.trackFileExportViaTelemetry();
            // Track export of trade table via telemetry
            if (this.exportComposite.exportConfig.exportLevel === ExportLevel.GRID) {
                this.trackExportViaTelemetry();
            }
            this.updateExportingStatus(false, this.exportComposite);
            // Next Observer interface for completion or erroring out of export
            const exportComplete: NextObserver<any> = {
                next: downloadCompleted => this.updateExportingStatus(downloadCompleted, this.exportComposite),
                error: err => {
                    // Update the export status so the spinner stops
                    this.updateExportingStatus(true);
                    this.notificationService.error(ExportUtils.getExportType(this.exportComposite) + ' failed to export.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CLOSE_MODAL_ERROR);
                }
            };

            if (this.exportComposite instanceof ExportComposite && this.exportComposite.exportConfig instanceof WorkpadExcelExportConfig) {
                this.downloadInProgress = !this.exportService.exportWorkpadToExcel(this.exportComposite).subscribe(exportComplete);
                // If this is a TablePDFExportConfig with 'print-as-is' option set as false, then call a different callback that goes to the server instead
            } else if (this.exportComposite.exportConfig instanceof ExcelExportConfig || (this.exportComposite.exportConfig instanceof TablePDFExportConfig && !this.exportComposite.exportConfig.printAsIs) || !isNil(this.exportComposite.tableData)) {
                this.exportService.exportFile(this.exportComposite).subscribe(exportComplete);
            } else {
                this.exportService.processPDF(this.exportComposite);
            }
            // Set user preference for Export To Excel/PDF
            const preferenceName = this.exportComposite.exportConfig instanceof ExcelExportConfig ? UserPreference.EXPORT_EXCEL : UserPreference.EXPORT_PDF;
            UserMetaDataStore.setPreferenceValue(preferenceName , JSON.stringify(this.exportComposite.exportConfig.serialize()));
        }
        this.modalClosed.emit(applyChange);
    }

    /**
     * track export details via telemetry
     */
    trackExportViaTelemetry(): void {
        const exportTradeTableParams = new TelemetryTradeTableExportParameters({exportType: this.exportComposite.exportConfig instanceof ExcelExportConfig ? ExportType.EXPORT_TO_EXCEL : ExportType.EXPORT_TO_PDF});
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.EXPORT_TRADE_TABLE, exportTradeTableParams);
    }

    /**
     * Track file export with options via telemetry
     */
    trackFileExportViaTelemetry(): void {
        const expTypeLevel = this.getExportLevelAndType();
        const param = expTypeLevel.exportType === ExportType.EXPORT_TO_PDF ?
            this.getPdfExportOptions(expTypeLevel.exportLevel) :
            this.getExcelExportOptions(expTypeLevel.exportLevel);
        TelemetryService.track(expTypeLevel.exportType === ExportType.EXPORT_TO_PDF ?
            TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_PDF_EXPORT :
            TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_EXCEL_EXPORT, param);
    }

    getExportLevelAndType(): any {
        let export_level: ExportLevel;
        let export_type: ExportType;
        if (this.exportComposite instanceof WorkspaceExportComposite) {
            export_level = ExportLevel.WORKSPACE;
            export_type = this.getExportTypeForWorkspace();
        } else if (this.exportComposite.exportConfig instanceof ExcelExportConfig &&
            this.exportComposite.exportConfig.exportLevel === ExportLevel.WIDGET) {
            export_level = ExportLevel.WIDGET;
            export_type = ExportType.EXPORT_TO_EXCEL;
        } else if ((this.exportComposite.exportConfig instanceof TablePDFExportConfig ||
                this.exportComposite.exportConfig instanceof PDFExportConfig) &&
            this.exportComposite.exportConfig.exportLevel === ExportLevel.WIDGET) {
            export_level = ExportLevel.WIDGET;
            export_type = ExportType.EXPORT_TO_PDF;
        } else if (this.exportComposite.exportConfig instanceof ExcelExportConfig) {
            export_level = ExportLevel.REPORT;
            export_type = ExportType.EXPORT_TO_EXCEL;
        } else if (this.exportComposite.exportConfig instanceof PDFExportConfig) {
            export_level = ExportLevel.REPORT;
            export_type = ExportType.EXPORT_TO_PDF;
        }
        return ({
            exportLevel: export_level,
            exportType: export_type
        });
    }

    /**
     * Get Export type for workspace
     */
    getExportTypeForWorkspace(): ExportType {
        let export_type: ExportType;
        if (this.exportComposite.exportConfig instanceof WorkpadExcelExportConfig) {
            export_type = ExportType.EXPORT_TO_EXCEL;
        } else if (this.exportComposite.exportConfig instanceof PDFExportConfig) {
            export_type = ExportType.EXPORT_TO_PDF;
        }
        return export_type;
    }

    /**
     * Get PDF export options
     */
    getPdfExportOptions(exportLevel): TelemetryExportPDFRequestParameters {
        const conf = this.exportComposite.exportConfig as PDFExportConfig;

        const orientation = PDFExportOrientation.getAllPDFExportOrientations()[conf.orientation]?.label;
        const appendTimestamp = conf.appendTimestamp;
        // if Widget then populate Scale value in layout field in telemetry
        const layout = this.getPdfLayout(exportLevel, conf);
        const pageFormat = PDFPageFormat.getAllPDFPageFormats()[conf.pageFormat]?.label;
        const pageMargin = PDFPageMargin.getLabel(conf.pageMargin);
        const printAsIs = !!conf.printAsIs;
        const isLogoEnabled = conf.logoConfig.logoPresent;
        const logoPresent = conf.logoConfig.logoPresent;
        const logoPosition = this.getLogoPosition(conf);
        const showLogoPreview = conf.logoConfig.showLogoPreview;
        return new TelemetryExportPDFRequestParameters(exportLevel, orientation, appendTimestamp, layout,
            pageFormat, pageMargin, printAsIs, isLogoEnabled, logoPresent, logoPosition, showLogoPreview);
    }

    getPdfLayout(exportLevel: ExportLevel, conf): string {
        if (exportLevel !== ExportLevel.WIDGET) {
            return PDFPageLayout.getAllPDFPageLayouts()[conf.layout]?.label;
        }
        if (this.exportComposite.exportConfig instanceof TablePDFExportConfig && !conf.printAsIs) {
            return TablePDFScaling.getAllTablePDFScalings()[conf.scaling].label;
        }
        return ExportConstants.NOT_AVAILABLE;
    }

    /**
     * Get EXCEL export options
     */
    getExcelExportOptions(exportLevel): TelemetryExportExcelRequestParameters {
        const conf = this.exportComposite.exportConfig as ExcelExportConfig;
        const showAllRecord = conf.fullyExpanded;
        const breakdownDisplay = ExportUtils.getBreakdownDisplay(conf);
        const outlineStyle = ExcelExportOutlineStyle.getAllExcelExportOutlineStyles()[conf.outlineStyle].label;
        const freezeColumnHeaders = conf.freezeColumnHeaders;
        const suppressRowShading = conf.suppressRowShading;
        const useMergedCellFooter = conf.useMergedCellFooter;
        const appendTimestamp = conf.appendTimestamp;
        return new TelemetryExportExcelRequestParameters(exportLevel, showAllRecord, breakdownDisplay, outlineStyle,
            freezeColumnHeaders, suppressRowShading, useMergedCellFooter, appendTimestamp);
    }

    /**
     * Returns logo position only if Logo Present checkbox is checked off
     */
    getLogoPosition(conf): string {
        if (conf.logoConfig.logoPresent) {
            return PDFLogoPosition.getAllPDFLogoPosition()[conf.logoConfig.logoPosition].label;
        } else {
            return ExportConstants.NOT_SPECIFIED;
        }
    }

    /**
     * Updates Exporting Status
     */
    updateExportingStatus(downloadCompleted: boolean, exportComposite?: ExportComposite): void {
        this.downloadInProgress = !downloadCompleted;
        this.appStore.updateExportDownloadingStatus(this.downloadInProgress, exportComposite);
    }

    /**
     * Validate PGS Chart Report Group
     * Show warning notification when exporting a report group that contains PGS chart widgets
     * @private
     */
    private validatePgsChartReportGroup() {
        if (this.exportComposite instanceof WorkpadExportComposite) {
            let hasPgsChartWidget = false;
            if (!isNil(this.exportComposite?.workpad?.activeReport?.widgets)) {
                for (const widget of this.exportComposite.workpad.activeReport.widgets) {
                    if (ChartUtils.isPGSGraphingSpritelet(widget.configType)) {
                        hasPgsChartWidget = true;
                        break;
                    }
                }
            }
            if (hasPgsChartWidget) {
                this.notificationService.warning(AlertConstants.NOTIFICATION.PGS_REPORT_GROUP_EXPORT, 'UI_VALIDATION_ERROR', null, true);
            }
        }
    }
}
