import {isObject, isString, map} from 'lodash';
import {Portfolio} from '../portfolio/portfolio.model';
import {Report} from '../workspace/report.model';
import {ExcelExportConfig} from '../export/excel-export-config.model';
import {ExportConfig} from '@interfaces/export-config.interface';
import {BatchRowDownloadStatus} from '@enums/batch-reporting/batch-row-download-status.enum';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {AbstractConfig, ConfigTypeFactory, SerializeFavoriteType} from '@blk/explore-ui-core';
import {BatchRowSkippedRequest} from '@models/batch-reporting/batch-row-skipped-request.model';

/**
 * Class for a batch row within a BatchReportConfig
 */
export class BatchRowConfig extends AbstractConfig {
    portfolio: Portfolio;
    runAs: BatchExportRunAs = BatchExportRunAs.PORTFOLIOS;
    reports: Report[] = []; // List of actual Report(Layout) configs to use to generate the requests with proper widgets
    exportConfig: ExportConfig = new ExcelExportConfig();
    active = true;
    downloadStatus: BatchRowDownloadStatus = BatchRowDownloadStatus.NONE;
    skippedRequests: BatchRowSkippedRequest[] = [];
    isEpnlReport = false;
    portfolios: Portfolio[]; // Collection of portfolios needed for this row's reports to run properly (like ComparisonConfig)
    reinitializeReportOptions?: () => void;
    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'BatchRowConfig';
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Returns the type of ExportConfig
     */
    get exportAs(): string {
        return this.exportConfig.getExportType();
    }

    /**
     * Returns whether the BatchRowConfig is completely filled out or not
     */
    isValid(): boolean {
        if (!this.portfolio) {
            return false;
        }
        if (!this.portfolio.portName) {
            return false;
        }
        if (!this.portfolio.benchmark) {
            return false;
        }
        if (!this.portfolio.currency) {
            return false;
        }
        if (!this.portfolio.datePicker || this.portfolio.datePicker.date === '') {
            return false;
        }
        if (this.reports && this.reports.length === 0) {
            return false;
        }
        return true;
    }

    /**
     * If the BatchRowConfig doesn't have a portfolio and any reports, it is essentially empty
     */
    isEffectivelyEmpty(): boolean {
        return (!this.portfolio || !this.portfolio.portName) && this.reports.length === 0;
    }

    /**
     * Serialize the config to json.
     * @param isNested an optional parameter to indicate that the favorite is a nested one.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            portfolio: this.portfolio.serialize(),
            runAs: this.runAs,
            exportConfig: this.exportConfig.serialize(),
            active: this.active,
            isEpnlReport: this.isEpnlReport
        };

        // Iterate through the reports and serialize them
        data.reports = map(this.reports, (report: Report) => report.serialize(true));

        return data;
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        this.portfolio = ConfigTypeFactory.createConfig(data.portfolio, Portfolio.configType, false);
        if (isString(data.runAs)) {
            // Cater for Prism Favorites whose enums aren't associated with numbers
            this.runAs = BatchExportRunAs[data.runAs as string];
        } else {
            this.runAs = BatchExportRunAs[BatchExportRunAs[data.runAs]];
        }
        this.reports = map(data.reports, (report: any) => ConfigTypeFactory.createConfig(report, report.configType, false));
        this.exportConfig = ConfigTypeFactory.createConfig(data.exportConfig, data.exportConfig.configType, false);
        this.active = data.active;
        this.isEpnlReport = data.isEpnlReport;
    }
}
