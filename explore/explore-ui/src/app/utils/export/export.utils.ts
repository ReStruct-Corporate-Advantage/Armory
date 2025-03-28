import * as baseToArraybuffer from 'base64-arraybuffer';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {BatchExportingStore, WorkspaceStore} from '../../stores';
import {ExportConstants, ExportLevel} from '@constants/export.constants';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {isArray, isUndefined} from 'lodash';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {ChartUtils} from '@utils/chart.utils';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {Widget} from '@models/widget/widget.model';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {WorkspaceMenuItemsConstants} from '@constants/workspace-menu-items.constants';
import {AppStore} from '../../app.store';
import {AppUtils} from '@utils/app.utils';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {ImageExportConfig} from '@models/export/image-export-config.model';
import {ColDef, ProcessCellForExportParams, ValueFormatterFunc, ValueFormatterParams} from 'ag-grid-community';
import {AlertConstants, ColumnConstants} from '@blk/explore-ui-core';
import {ExcelExportOutlineStyle} from '@enums/export/excel-export-outline-style.enum';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';

export class ExportUtils {
    /**
     * Process the response and trigger file download
     */
    static processDownload(exportOptions: any, fileParts: string|string[], targetDirectory: string, fileName?: string, isBatchRequest?: boolean) {
        if (BatchExportingStore.isBatchCanceled() || !fileParts || (isBatchRequest && !BatchExportingStore.currentBatchExportAction)) {
            return;
        }
        let fileNameFormatted;
        if (fileName) {
            fileNameFormatted = fileName;
        }
        let rawData = '';
        if (isArray(fileParts)) {
            for (const filePart of fileParts) {
                rawData += filePart;
            }
        } else {
            rawData = fileParts;
        }
        if (rawData.startsWith('FileName|')) {
            rawData = rawData.substring('FileName|'.length);
            fileNameFormatted = rawData.substring(0, rawData.lastIndexOf('|'));
            rawData = rawData.substring(fileNameFormatted.length + 1);
        }
        // download the file when all the parts have been merged
        ExportUtils.download(rawData, fileNameFormatted, exportOptions.type, targetDirectory, isBatchRequest);
    }

    /**
     * Download file util function
     */
    static download(rawData: string, fileName: string, downloadType: string, targetDirectory?: string, isBatchRequest?: boolean, allowDecode = true) {
        const bytes = baseToArraybuffer.decode(rawData);
        let blob: any;
        // Don't use decoded bytes for BLO export
        if (allowDecode) {
            blob = new Blob([bytes], {type: downloadType});
        } else {
            blob = new Blob([rawData], {type: downloadType});
        }

        // Now add the element into the dom so it can be downloaded.
        const file: any = URL.createObjectURL(blob);
        const a: any = document.createElement('a');
        a.href = file;
        a.download = ExportUtils.sanitizeFileName(fileName);
        document.body.appendChild(a);
        // For EbC we need to set the downloadSettings using the EbC APIs, since we do not want to hinder the export flow in Chrome
        // where we do want to keep the File Downloader mechanism, we are adding a the downloadSettings in a
        // conditional loop here just for EbC environment

        // we only want to go in this condition if we are in EbC environment and we are doing Batch Export
        // for normal exports we do not want to change any download settings
        if (AppStore.isEBCDownloaderEnabled && isBatchRequest && targetDirectory !== '') {
            // we update the target directory and downloadFrom path via the API provided by EbC
            AppUtils.ebcObject().updateDownloadSettings(ExportUtils.downloadSettingsUpdate(a, targetDirectory));
        }
        a.click();

        // Remove the anchor tag so it doesn't clutter the DOM
        document.body.removeChild(a);
    }

    /**
     * Returns a unix timestamp
     */
    static getUniqueTimestamp(): number {
        const d = new Date();
        return d.getTime();
    }

    /**
     * Creates ExportComposite according to the export type i.e excel or PDF
     */
    static getExportComposite(exportType: string, exportLevel: string, widget?: Widget, chartingLib?: string, tableData?: any, outlineData?: any): ExportComposite {
        const composite = new ExportComposite();
        composite.report = WorkspaceStore.getCurrentReport();
        composite.portfolio = WorkspaceStore.getCurrentPortfolio();
        composite.widget = widget;

        if (exportType === WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF) {
            if (exportLevel === ExportConstants.EXPORT_PDF_REPORT) {
                composite.exportConfig = new PDFExportConfig();
                composite.widget = null;
            } else if (exportLevel === ExportConstants.EXPORT_WIDGET && !isUndefined(widget)) {
                composite.exportConfig = ExportUtils.createDefaultWidgetPDFExportConfig(widget);
            } else if (exportLevel === ExportLevel.GRID) {
                composite.exportConfig = new TablePDFExportConfig();
            }
            // If the report has comparison in it, we need to get all the portfolios for later PDF processing
            if (WorkspaceStore.getCurrentWorkpad()?.hasComparisonPortfolios(composite.report.comparisonConfigId)) {
                composite.portfolios = WorkspaceStore.getCurrentWorkpad().getAllPortfolios();
            }
        } else if (exportType === WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE) {
            composite.exportConfig = new ImageExportConfig();
        } else {
            composite.exportConfig = new ExcelExportConfig();
            if (exportLevel === ExportConstants.EXPORT_WIDGET && !isUndefined(widget)) {
                composite.exportConfig.appendTimestamp = true;
                composite.exportConfig.exportLevel = ExportLevel.WIDGET;
            }
        }
        // Add tableData and update export level for table exports other than widget
        if (exportLevel === ExportLevel.GRID) {
            composite.tableData = tableData;
            composite.exportConfig.exportLevel = ExportLevel.GRID;
        }
        if (outlineData) {
            composite.outlineData = outlineData;
        }
        composite.chartingLib = chartingLib;
        return composite;
    }

    /**
     * Gets the export type based on the exportComposite
     */
    static getExportType(exportComposite: ExportComposite): string {
        if (exportComposite instanceof WorkspaceExportComposite) {
            return ExportLevel.WORKSPACE;
        } else if (exportComposite instanceof WorkpadExportComposite) {
            return ExportLevel.REPORT_GROUP;
        } else if (exportComposite.widget && exportComposite.widget.id) {
            return ExportLevel.WIDGET;
        } else {
            return ExportLevel.REPORT;
        }
    }

    /**
     * Returns a default widget PDFExportConfig
     */
    static createDefaultWidgetPDFExportConfig(widget: Widget): PDFExportConfig {
        let exportConfig: PDFExportConfig;
        const isChartWidget = !isUndefined(widget) && ChartUtils.isChartWidget(widget);
        exportConfig = isChartWidget ? new PDFExportConfig() : new TablePDFExportConfig();
        exportConfig.appendTimestamp = true;
        exportConfig.exportLevel = ExportLevel.WIDGET;
        exportConfig.layout = PDFPageLayout.W1X1;
        exportConfig.printAsIs = isChartWidget;
        exportConfig.logoConfig.logoPresent = false;
        return exportConfig;
    }

    /**
     * Returns true if passed in exportDownloadingStatus is Valid
     */
    static isExportDownloadingStatusValid(exportDownloadingStatus: ExportDownloadingStatus): boolean {
        return !!(exportDownloadingStatus && exportDownloadingStatus.exportComposite && exportDownloadingStatus.downloadInProgress);
    }

    /**
     * Method to init the excel export outline style options
     */
    static populateExcelExportOutlineStyleOptions(isOutlineStyleChecked:boolean, outlineStyle: ExcelExportOutlineStyle):AuxRadioInterface[] {
        return [
            {
                label: 'Horizontal',
                eventData: ExcelExportOutlineStyle.HORIZONTAL,
                checked: ExcelExportOutlineStyle.HORIZONTAL === outlineStyle,
                disabled: !isOutlineStyleChecked
            },
            {
                label: 'Vertical',
                eventData: ExcelExportOutlineStyle.VERTICAL,
                checked: ExcelExportOutlineStyle.VERTICAL === outlineStyle,
                disabled: !isOutlineStyleChecked
            }
        ];
    }

    /**
     * Replaces illegal characters in a file name for export downloads
     */
    static sanitizeFileName(fileName: string): string {
        // Replace illegal characters (< > : " / \ | ? *) with "_"
        fileName = fileName.replace(/[\*|<|>|:|\"|\/|\\|\||\?]/g, '_');
        // Replace the '.' with an empty string
        return fileName.replace(/\./g, '');
    }

    static downloadSettingsUpdate(downloadFromURL: URL, downloadDirectory: string) {
        return {
            'downloadFrom': new URL(downloadFromURL.href).pathname,
            'downloadSettingOptions': {
                'downloadTo': downloadDirectory,
                'overwriteDownloads': false
            }
        };
    }

    /**
     * Callback when user copies (ctrl+c) cells from the table
     */
    static processCellForExport(params: ProcessCellForExportParams) {
        const colDef: ColDef = params.column.getColDef();
        if (colDef.valueFormatter && typeof colDef.valueFormatter !== 'string') {
            return (colDef.valueFormatter as ValueFormatterFunc)({
                ...params,
                data: params.node?.data,
                colDef
            } as ValueFormatterParams);
        }
        // When copying from the grid, row group cells will default to returning value=rowId due to the data being: data['level-1'] === <rowId>
        // what we want to instead return is data['ag-Grid-AutoColumn']
        const colId: string = params.column.getColId();
        if (colId === ColumnConstants.AUTO_GRP_COLUMN) {
            // return data['ag-Grid-AutoColumn'] if it exists
            return params.node?.data[colId] || params.value;
        }
        return params.value;
    }


    /**
     * Method to init the Breakdown display options
     */
    static populateBreakdownDisplayOptions(isFilterFriendly: boolean, isGroupingEnabled: boolean): AuxRadioInterface[] {
        return [
            {
                label: ExportConstants.FLAT_DATA_INDENTATION,
                checked: (!isFilterFriendly && !isGroupingEnabled)
            },
            {
                label: ExportConstants.FLAT_DATA_FILTERING,
                checked: isFilterFriendly
            },
            {
                label: ExportConstants.GROUPED_DATA,
                checked: isGroupingEnabled
            }
        ];
    }

    /**
     * Get Breakdown options label
     */
    static getBreakdownDisplay(conf): string {
        if (!conf.isFilterFriendly && !conf.isGroupingEnabled) {
            return ExportConstants.FLAT_DATA_INDENTATION;
        } else if (conf.isFilterFriendly) {
            return ExportConstants.FLAT_DATA_FILTERING;
        } else if (conf.isGroupingEnabled) {
            return ExportConstants.GROUPED_DATA;
        }
        return ExportConstants.NOT_SPECIFIED;
    }

    static checkGenerateApiRequestSupported(portfolio: Portfolio): [boolean, string] {

        if (portfolio instanceof AdhocPortfolio || portfolio instanceof AdhocPortGroup) {
            return [false, AlertConstants.NOTIFICATION.CUSTOM_SCRATCH_PORT_ERROR];
        } else if (portfolio instanceof WhatIfPortfolio) {
            return [false, AlertConstants.NOTIFICATION.WHAT_IF_PORT_ERROR];
        } else if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(WorkspaceStore.getCurrentReport().comparisonConfigId)) {
            return [false, AlertConstants.NOTIFICATION.COMPARISON_VIEW_ERROR];
        }
        return [true, undefined];
    }
}
