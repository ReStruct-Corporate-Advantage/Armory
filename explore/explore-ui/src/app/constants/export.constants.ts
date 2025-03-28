import {AuxInlineMenuInterface} from '@blk/aladdin-angular-components';
import {WorkspaceMenuItemsConstants} from './workspace-menu-items.constants';

/**
 * Constants for Export
 */
export class ExportConstants {
    static readonly DOWNLOAD_TYPE_LINK = 'LINK';
    static readonly DOWNLOAD_TYPE_FILE_DOWNLOADER = 'FILE_DOWNLOADER';
    static readonly PDF_TYPE = 'application/pdf';
    static readonly IMAGE_TYPE = 'image/png';
    static readonly EXCEL_TYPE_XLS = 'application/vnd.ms-excel';
    static readonly EXCEL_TYPE_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    static readonly EXCEL_XLSX_FILE_EXTENSION = 'xlsx';
    static readonly HTML_TYPE = 'text/html';
    static readonly EXPORT_OPTIONS = 'Export Options';
    static readonly EXPORT_PDF_WIDGET = 'Export PDF Widget';
    static readonly EXPORT_PDF_REPORT = 'Export PDF Report';
    static readonly EXPORT_WIDGET = 'Export Widget';
    static readonly EPNL_REPORT = 'EPNL Report';
    static readonly WORKSPACE_REPORT = 'Workspace Report';
    static readonly NO_WIDGETS_FOUND = 'NO WIDGETS FOUND';
    static readonly PDF = 'PDF';
    static readonly IMAGE = 'IMAGE';
    static readonly EXCEL = 'Excel';
    static readonly EXPORT_FULLY_EXPANDED = 'All data, expanded';
    static readonly VISIBLE_DATA_ONLY = 'Currently visible data only';
    static readonly EXPORT_CUSTOM_LEVEL = 'Custom level';
    static readonly FLAT_DATA_INDENTATION = 'Flat data with indentation';
    static readonly FLAT_DATA_FILTERING = 'Flat data + column headers with filtering';
    static readonly GROUPED_DATA = 'Grouped data with expandable, nested rows';
    static readonly NOT_SPECIFIED = 'None Selected';
    static readonly NOT_AVAILABLE = 'Not Available';

    // PDFPageMargin constants
    static readonly PAGE_MARGIN_NORMAL = 'NORMAL';
    static readonly PAGE_MARGIN_NARROW = 'NARROW';
    static readonly PAGE_MARGIN_MODERATE = 'MODERATE';
    static readonly PAGE_MARGIN_WIDE = 'WIDE';
    static readonly PAGE_MARGIN_CUSTOM = 'CUSTOM';

    // BLO export constants
    static readonly ALADDIN_SEC_ID = 'ALADDIN_SEC_ID';
    static readonly ORDER_QTY = 'ORDER_QTY';
    static readonly ORDER_TRAN_TYPE = 'ORDER_TRAN_TYPE';
    static readonly BLO_FORMAT_TRADES = 'Trades in BLO format';

    static readonly EXPORT_OPTION_PDF: AuxInlineMenuInterface = {
        label: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF,
        eventData: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF,
        leftIcon: 'widget-export'
    };
    static readonly EXPORT_OPTION_BLO: AuxInlineMenuInterface = {
        label: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_BLO,
        eventData: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_BLO,
        leftIcon: 'widget-export'
    };
    static readonly EXPORT_OPTION_IMAGE: AuxInlineMenuInterface = {
        label: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE,
        eventData: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_IMAGE,
        leftIcon: 'widget-export'
    };
    static readonly EXPORT_OPTION_EXCEL: AuxInlineMenuInterface = {
        label: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL,
        eventData: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL,
        leftIcon: 'widget-export'
    };
    static readonly GENERATE_API_REQUEST_OPTION: AuxInlineMenuInterface = {
        label: WorkspaceMenuItemsConstants.LABELS.GENERATE_API_REQUEST,
        eventData: WorkspaceMenuItemsConstants.LABELS.GENERATE_API_REQUEST,
        leftIcon: 'widget-export'
    };

    static readonly SCHEDULE_JOB_OPTION: AuxInlineMenuInterface = {
        label: WorkspaceMenuItemsConstants.LABELS.SCHEDULE_JOB,
        eventData: WorkspaceMenuItemsConstants.LABELS.SCHEDULE_JOB,
        leftIcon: 'widget-export'
    };

    static readonly EXPORT_OPTION_PDF_EXCEL: AuxInlineMenuInterface[][] = [[
        ExportConstants.EXPORT_OPTION_PDF,
        ExportConstants.EXPORT_OPTION_EXCEL
    ]];

    static readonly EXPORT_OPTION_PDF_EXCEL_BLO: AuxInlineMenuInterface[][] = [[
        ExportConstants.EXPORT_OPTION_PDF,
        ExportConstants.EXPORT_OPTION_EXCEL,
        ExportConstants.EXPORT_OPTION_BLO
    ]];

    static readonly EXPORT_OPTION_PDF_EXCEL_IMG: AuxInlineMenuInterface[][] = [[
        ExportConstants.EXPORT_OPTION_PDF,
        ExportConstants.EXPORT_OPTION_EXCEL,
        ExportConstants.EXPORT_OPTION_IMAGE
    ]];

    static readonly EXPORT_OPTION_PDF_IMG: AuxInlineMenuInterface[][] = [[
        ExportConstants.EXPORT_OPTION_PDF,
        ExportConstants.EXPORT_OPTION_IMAGE
    ]];

    static readonly BATCH_FILE_NAME_PLACEHOLDER = {
        PORTFOLIO: '[PORTFOLIO]',
        DATE: '[DATE]',
        REPORT: '[REPORT]',
        BENCHMARK: '[BENCH]',
        CURRENCY: '[CURRENCY]'
    };

    static readonly EXPORT_AS_OPTIONS = {
        PDF: 'pdf',
        EXCEL: 'excel',
        CSV: 'csv',
        JSON:'json'
    };


    static readonly SCHEDULED_BATCH_COMMANDS = {
        ADD_TO_QUEUE: 'ADD_TO_QUEUE'
    };
}

export enum ExportLevel {
    WIDGET = 'Widget',
    REPORT = 'Report',
    WORKSPACE = 'Workspace',
    REPORT_GROUP = 'Report group',
    GRID = 'Grid'
}

