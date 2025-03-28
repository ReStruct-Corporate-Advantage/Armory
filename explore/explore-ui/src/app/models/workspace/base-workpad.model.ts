import {isUndefined, isNil, find, filter} from 'lodash';
import {Report} from './report.model';
import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {Portfolio} from '../portfolio/portfolio.model';
import {ComparisonConfig} from '@models/config/comparison-config.model';

/**
 * Base class for FlatWorkpad and ReportGroup
 */
export abstract class BaseWorkpad extends AbstractConfig {
    reports: Report[] = [];
    activeReport: Report;

    // Maps the report comparison id to the appropriate comparison config
    comparisonConfigMap: Map<number, ComparisonConfig> = new Map<number, ComparisonConfig>();
    /**
     * When deserializing this function may be called to see if the object is supported by this type.
     */
    static supportsObject(object: any): boolean {
        return object.configType === 'workpad' || object.configType === 'workpads' || object.configType === 'WORKPAD' || !isUndefined(object.reports);
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'workpad';
    }

    /**
     * getConfigType
     */
    getConfigType(): string {
        return BaseWorkpad.configType;
    }

    /**
     * deserialize
     */
    deserialize(data: any): void {
        const reports = data.reports || data.layouts;

        if (data.comparisonConfigMap) {
            for (const entry of data.comparisonConfigMap) {
                const comparisonConfig = new ComparisonConfig(entry[1]);
                this.comparisonConfigMap.set(entry[0], comparisonConfig);
            }
        }

        if (reports) {
            for (const reportData of reports) {
                const report: Report = new Report(reportData);
                this.reports.push(report);
                this.updateComparisonConfigMap(report);
                report.comparisonConfigLegacyPlaceholder = null;
            }
        }
    }

    /**
     * serialize
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            configType: this.getConfigType(),
            reports: []
        };

        for (const report of this.reports) {
            data.reports.push(report.serialize(isNested));
        }
        const configMapData = [];
        for (const entry of this.comparisonConfigMap.entries()) {
                configMapData.push([entry[0], entry[1].serialize()]);
        }

        if (configMapData.length) {
            data.comparisonConfigMap = configMapData;
        }

        return data;
    }

    /**
     * add one or many reports
     */
    addReports(reportsToAdd: Report | Report[]): void {
        if (Array.isArray(reportsToAdd)) {
            for (const report of reportsToAdd) {
                if (!isNil(report)) {
                    this.reports.push(report);
                    this.updateComparisonConfigMap(report);
                }
            }
        } else {
            if (!isNil(reportsToAdd)) {
                this.reports.push(reportsToAdd);
                this.updateComparisonConfigMap(reportsToAdd);
            }
        }
    }

    /**
     * remove a report
     */
    removeReport(reportToRemove: Report): void {
        const index = this.reports.indexOf(reportToRemove);
        if (index !== -1) {
            this.reports.splice(index, 1);
        }
        this.comparisonConfigMap.delete(reportToRemove.comparisonConfigId);
        // Clean up all widget long running requests in the report
        reportToRemove.removeAllWidgetLongRunningRequests();
    }

    /**
     * replace old report with new report
     */
    replaceReport(newReport: Report, oldReport: Report): void {
        const index = this.reports.findIndex(report => report === oldReport);
        this.reports[index] = newReport;
        this.activeReport = newReport;
        this.updateComparisonConfigMap(newReport);
    }

    /**
     * This function tells if a particular report is in a compare mode or not
     */
    isCompareMode(reportKey: number): boolean {
        const comparisonConfig: ComparisonConfig = this.comparisonConfigMap.get(reportKey);
        if (!isNil(comparisonConfig)) {
            return comparisonConfig != null && comparisonConfig.portComparisonList.length > 1;
        }
        return false;
    }

    /**
     * Returns true if the report has portfolios that are compared
     */
    hasComparisonPortfolios(reportKey: number): boolean {
        return !!(this.comparisonConfigMap.get(reportKey)?.hasPortfolios());
    }

    /**
     * Adds the legacy comparison configuration to the configuration map if it is not already present
     */
    updateComparisonConfigMap(report: Report): void {
        if (report.comparisonConfigLegacyPlaceholder?.portComparisonList?.length > 1 && isNil(this.comparisonConfigMap.get(report.comparisonConfigId))) {
            // Only add a legacy comparison config to the map if it's valid
            // A comparison config is valid if it has at least 2 portfolios that also exist in the workpad portfolios
            const matchingPortfolios = filter(report.comparisonConfigLegacyPlaceholder.portComparisonList, port => find(this.getAllPortfolios(), portfolio => port === portfolio.portId));
            if (matchingPortfolios.length > 1) {
                this.comparisonConfigMap.set(report.comparisonConfigId, report.comparisonConfigLegacyPlaceholder);
            }
        }
    }

    /**
     * get all portfolios
     */
    abstract getAllPortfolios(): Portfolio[];

    /**
     * add Portfolios
     * FlatWorkpad CANNOT take array for portfoliosToAdd, since it can have only ONE Portfolio.
     */
    abstract addPortfolios(portfoliosToAdd: Portfolio | Portfolio[], index?: number): void;

    /**
     * replace Portfolio(s)
     * FlatWorkpad CANNOT take array for portfoliosToAdd, since it can have only ONE Portfolio.
     * if oldPortfolio is NOT given, override the portfolio(s) of the workpad
     * else, replace the new portfolio with the old portfolio
     */
    abstract replacePortfolios(newPortfolio: Portfolio | Portfolio[], oldPortfolio?: Portfolio): void;
}
