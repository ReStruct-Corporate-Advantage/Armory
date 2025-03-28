import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Security} from '@interfaces/security.interface';
import {ColumnConfig, WayToAddSecurity} from '@blk/explore-ui-core';
import {CompositionConstants} from '@constants/composition.constants';
import {CommonConstants} from '@constants/common.constants';
import {isNil} from 'lodash';
import {OptimizationConstants} from '@constants/optimization.constants';
import {ModellingType} from '@enums/modelling-type.enum';
import {PortfolioItem} from '@interfaces/portfolio-item.interface';

@Component({
    selector: 'app-security-upload',
    templateUrl: './security-upload.component.html',
    styleUrls: []
})
export class SecurityUploadComponent implements OnChanges {

    static IMPORT_DATA_FORMAT_UPLOAD_ALPHA = [['Cusip 1', 'Alpha 1'], ['Sedol 2', 'Alpha 2'], ['ISIN 3', 'Alpha 3']];

    static IMPORT_DATA_FORMAT_UPLOAD_RISK_CONTRIBUTION_PCT = [['Cusip 1', '10%'], ['Sedol 2', '20%'], ['ISIN 3', '30%']];

    static IMPORT_DATA_FORMAT = [['Cusip 1'], ['Sedol 2'], ['ISIN 3'], ['Bloomberg Ticker 4']];

    static IMPORT_DATA_FORMAT_WITH_WEIGHTS = [['Cusip 1', '25'], ['Sedol 2', '15'], ['ISIN 3', '10'], ['Bloomberg Ticker 4', '20']];

    static IMPORT_DATA_PORTFOLIOS = [['Portfolio 1', '25', '', ''], ['Portfolio 2', '15', '', ''], ['What-If Portfolio 1', 'POINT_IN_TIME', 'owner1', '10'], ['What-If Portfolio 2', 'THROUGH_TIME', 'owner2', '20'], ['What-If Portfolio 3', 'FROM_SCRATCH_PORT', 'owner3', '10']];

    static IMPORT_DATA_FORMAT_WITH_WEIGHTS_PCT = [['Cusip 1', '25%'], ['Sedol 2', '15%'], ['ISIN 3', '10%'], ['Bloomberg Ticker 4', '20%']];

    /** Emits the securities uploaded */
    @Output()
    securitiesUploaded = new EventEmitter<{securities: Map<string, Security>, uploadType?: WayToAddSecurity}>();
    /** Emits flag to parent component signaling to show securities grid and hide upload view */
    @Output()
    showGrid = new EventEmitter();

    @Input()
    includeWeight: boolean;

    @Input()
    customColDef: any;

    @Input()
    modellingType: ModellingType;

    @Input()
    selectedModelingColumn: ColumnConfig;

    @Input()
    rootPortfolio: string;

    @Input()
    leafPortfolios: string[];

    uploadType: WayToAddSecurity;

    importConfig: any = {
        caption: 'Import securities by pasting from a spreadsheet or uploading a CSV file',
        title: 'Bulk Securities Upload',
        dataFormat: SecurityUploadComponent.IMPORT_DATA_FORMAT_WITH_WEIGHTS
    };


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.includeWeight) {
            if (!isNil(this.customColDef)) {
                if (this.customColDef.field === OptimizationConstants.UPLOAD_ALPHA_SECURITY_SEARCH_COL_DEF.field) {
                    this.importConfig.title = 'Bulk Alpha Upload';
                    this.importConfig.dataFormat = SecurityUploadComponent.IMPORT_DATA_FORMAT_UPLOAD_ALPHA;
                } else if (this.customColDef.field === OptimizationConstants.SECURITY_CONSTRAINT_RISK_BUDGETING_COL_DEF.field) {
                    this.importConfig.dataFormat = SecurityUploadComponent.IMPORT_DATA_FORMAT_UPLOAD_RISK_CONTRIBUTION_PCT;
                }
            } else if (this.includeWeight) {
                // Show data format for portfolios is user wants to upload a list of portfolios.
                if (this.modellingType === ModellingType.PORTFOLIO) {
                    this.importConfig.title = 'Bulk Portfolios Upload';
                    this.importConfig.caption = 'Import portfolios by pasting from a spreadsheet or uploading a CSV file';
                    this.importConfig.dataFormat = SecurityUploadComponent.IMPORT_DATA_PORTFOLIOS;
                } else {
                    this.importConfig.dataFormat = this.selectedModelingColumn && this.selectedModelingColumn.columnTag === CompositionConstants.PCT_NOTIONAL_MARKET_VALUE ?
                        SecurityUploadComponent.IMPORT_DATA_FORMAT_WITH_WEIGHTS_PCT : SecurityUploadComponent.IMPORT_DATA_FORMAT_WITH_WEIGHTS;
                }
            } else {
                this.importConfig.dataFormat = SecurityUploadComponent.IMPORT_DATA_FORMAT;
            }
        }
    }

    /**
     * Updates Security Key if space separated
     */
    private updateSecurityKeyIfSpaceSeparated(data: string[][]): string[][] {
        for (const row of data) {
            if (!row[0].includes(CommonConstants.SINGLE_SPACE)) {
                continue;
            }
            row[0] = row[0].replace(/\s/g, CommonConstants.ESCAPED_SPACE_CHAR);
        }
        return data;
    }

    /**
     * Creates securities from data parsed from the cells that were pasted
     * @param data Parsed data where each element in array is a seucrity and [0] is cusip, [1] is NMV
     */
    private createSecurities(data: string[][]): Map<string, Security> {
        data = this.updateSecurityKeyIfSpaceSeparated(data);

        const securitiesMap = new Map();
        // create each security in an error state and then attempt to validate against server
        return new Map(data.filter(row => row.length >= 1 && row[CommonConstants.SECURITY_INDEX].length > 0)
            .map(row => {
                const isRowInvalid = row.length < 2 || isNaN(Number(row[1]));
                const key = this.generateKey(row);
                if (!securitiesMap.has(key)) {
                    securitiesMap.set(key, Number(row[1]));
                } else {
                    securitiesMap.set(key, securitiesMap.get(key) + Number(row[1]));
                }
                // return map of cusip -> security
                return [key, {
                    error: 'Security not found',
                    ...(row[CommonConstants.SECURITY_INDEX].length === 9 ? {cusip: row[CommonConstants.SECURITY_INDEX]} : {}),
                    ...(row[CommonConstants.SECURITY_INDEX].length === 7 ? {sedol: row[CommonConstants.SECURITY_INDEX]} : {}),
                    ...(row[CommonConstants.SECURITY_INDEX].length === 12 ? {isin: row[CommonConstants.SECURITY_INDEX]} : {}),
                    description: null,
                    securityGroup: null,
                    addToPortfolio: this.getAddToPortfolio(row),
                    currentValue: 0.0,
                    newValue: (!isNil(this.customColDef) || isRowInvalid) ? 0.0 : securitiesMap.get(key),
                    alpha: (isNil(this.customColDef) || this.customColDef.field !== OptimizationConstants.UPLOAD_ALPHA_SECURITY_SEARCH_COL_DEF.field || isRowInvalid) ? 0.0 : Number(row[1]),
                    riskContributionPercentage: (isNil(this.customColDef) || this.customColDef.field !== OptimizationConstants.SECURITY_CONSTRAINT_RISK_BUDGETING_COL_DEF.field || isRowInvalid) ? 0.0 : Number(row[1])
                } as Security];
            })
        );
    }

    /**
     * creates portfolios from the data parsed from the cells that were pasted
     */
    private createPortfolioItems(data: string[][]): Map<string, PortfolioItem> {
        // create each portfolio item in an error state and then attempt to validate against server
        return new Map(
            data
                .filter(row => row.length >= 1 && !!row[CommonConstants.SECURITY_INDEX].length)
                .map(row => {
                    const key: string = !isNil(row[3])
                        ? row[0]
                        : row[0].toUpperCase();
                    // return map of portfolio/what-if portfolio -> row item
                    return [key, {
                        error: 'Portfolio not found',
                        ticker: isNil(row[3]) ? row[0].toUpperCase() : row[0],
                        owner: row[2],
                        portfolioType: row[3],
                        currentValue: 0.0,
                        newValue: Number((row[1] || CommonConstants.EMPTY_STRING).replace(/,/g, CommonConstants.EMPTY_STRING))
                    } as PortfolioItem];
                })
        );
    }

    /**
     * Method called when data is uploaded in Quick import screen
     * @param parsedData
     */
    onDataUploaded(parsedData: string[][]) {
        // create securities from the data
        const entitiesMap = this.modellingType === ModellingType.PORTFOLIO ? this.createPortfolioItems(parsedData) : this.createSecurities(parsedData);
        // let parent validate and add securities to table
        this.securitiesUploaded.emit({securities: entitiesMap, uploadType: this.uploadType});
    }

    setUploadType(uploadType: WayToAddSecurity) {
        this.uploadType = uploadType;
    }

    /**
     * validate the portfolio name and return valid name
     * @param addToPortfolio
     */
    getAddToPortfolio(row: string[]) {
        if (row.length === 3 && this.leafPortfolios.find(portfolio => portfolio === row[2])) {
            return row[2];
        }
        return this.rootPortfolio;
    }

    /**
     * Generates key using cusip/isin/sedol and the portfolio it is being added to.
     * Users can upload duplicate cusips to different portfolios. This ensures a unique
     * key is generated each time.
     * @param row
     * @private
     */
    private generateKey(row: string[]): string {
        return row.length === 3 && !isNil(row[2]) ? row[0] + CommonConstants.COLON + row[2] : row[0];
    }
}
