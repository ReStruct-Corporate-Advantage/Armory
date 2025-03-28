import {cloneDeep, every, filter, isNil, isObject} from 'lodash';
import {BatchRowConfig} from './batch-row-config.model';
import {Portfolio} from '../portfolio/portfolio.model';
import {Benchmark} from '../portfolio/benchmark.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {
    AbstractFavoriteConfig,
    CalendarDateUtils,
    ConfigTypeFactory,
    FavoriteDisplayEnum,
    SerializeFavoriteType
} from '@blk/explore-ui-core';

/**
 * Class for a batch report
 */
export class BatchReportConfig extends AbstractFavoriteConfig {
    fileName = '';
    downloadDirectory = '';
    mergeInOneFile: boolean;
    batchRowConfigs: BatchRowConfig[] = [];
    exportLocation = '';

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'BATCH_REPORT';
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
     * Add a new BatchRowConfig to the BatchReportConfig
     */
    addBatchRowConfig(): void {
        const batchRowConfig: BatchRowConfig = new BatchRowConfig();
        batchRowConfig.portfolio = new Portfolio('', CalendarDateUtils.getDefaultDateObject());
        batchRowConfig.portfolio.benchmark = new Benchmark();
        this.batchRowConfigs.push(batchRowConfig);
    }

    /**
     * Returns true if all BatchRowConfigs are active
     */
    allBatchRowConfigsActive(): boolean {
        return every(this.batchRowConfigs, (row: BatchRowConfig) => row.active);
    }

    /**
     * Returns a filtered list of BatchRowConfigs that are active
     */
    getActiveBatchRowConfigs(): BatchRowConfig[] {
        return filter(this.batchRowConfigs, (row: BatchRowConfig) => row.active && !row.isEpnlReport);
    }

    /**
     * Returns a filtered list of BatchRowConfigs that are active and Epnl
     */
    getActiveBatchRowEpnlConfigs(): BatchRowConfig[] {
        return filter(this.batchRowConfigs, (row: BatchRowConfig) => row.active && row.isEpnlReport);
    }

    /**
     * Returns a filtered list of BatchRowConfigs that are active and PDF
     */
    getActivePDFBatchRowConfigs(): BatchRowConfig[] {
        return filter(this.batchRowConfigs, (row: BatchRowConfig) => row.active && row.exportConfig instanceof PDFExportConfig);
    }

    /**
     * Returns if all active Batch Rows are filled out
     */
    allActiveBatchRowConfigsFilled(): boolean {
        return every(this.getActiveBatchRowConfigs(), (row: BatchRowConfig) => row.isValid());
    }

    /**
     * Returns the total number of reports to be generated in the batch report
     */
    getNumOfReports(): number {
        let numToDownload = 0;
        for (const row of this.getActiveBatchRowConfigs()) {
            numToDownload += row.reports.length;
        }
        return numToDownload;
    }

    /**
     * Gets the favorite type for this config.
     */
    getConfigType(): string {
        return 'BATCH_REPORT';
    }

    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};

        // If there is a fileName, then serialize it
        if (this.fileName) {
            data.fileName = this.fileName;
        }

        // If there is a download directory, then serialize it
        if (this.downloadDirectory) {
            data.downloadDirectory = this.downloadDirectory;
        }

        data.mergeInOneFile = this.mergeInOneFile;

        // Serialize BatchRowConfigs
        this.serializeBatchRowConfigs(this, data);

        return data;
    }

    protected doDeserialize(data: any) {
        // If there is a data element then check if the extra data is not null.
        if (!isNil(data.data)) {
            data = data.data;
        }

        if (data.fileName) {
            this.fileName = data.fileName;
        }

        if (data.downloadDirectory) {
            this.downloadDirectory = data.downloadDirectory;
        }

        this.mergeInOneFile = data.mergeInOneFile ? data.mergeInOneFile : false;

        this.deserializeBatchRowConfigs(data);
    }

    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof BatchReportConfig)) {
            return;
        }
        this.fileName = source.fileName;
        this.downloadDirectory = source.downloadDirectory;
        this.mergeInOneFile = source.mergeInOneFile;
        this.exportLocation = source.exportLocation;
        this.batchRowConfigs = cloneDeep(source.batchRowConfigs);
    }

    /**
     * Serialize the underlying BatchRowConfigs
     */
    private serializeBatchRowConfigs(batchReportConfig: BatchReportConfig, data: any): void {
        if (batchReportConfig.batchRowConfigs && batchReportConfig.batchRowConfigs.length > 0) {
            data.batchRowConfigs = [];
            for (const batchRowConfig of batchReportConfig.batchRowConfigs) {
                data.batchRowConfigs.push(batchRowConfig.serialize(true));
            }
        }
    }

    /**
     * Deserialize the underlying BatchRowConfigs
     */
    private deserializeBatchRowConfigs(data: any): void {
        for (const batchRowConfig of data.batchRowConfigs) {
            const rowConfig: BatchRowConfig = ConfigTypeFactory.createConfig(batchRowConfig, BatchRowConfig.configType, true);
            this.batchRowConfigs.push(rowConfig);
        }
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.BATCH_REPORT;
    }
}
