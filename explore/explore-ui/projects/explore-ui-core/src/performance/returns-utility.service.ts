import {find, isNil, isUndefined} from 'lodash';
import {BehaviorSubject, Observable} from 'rxjs';
import {CoreColumnUtils} from '../column/core-column.utils';
import {ColumnConfig} from '../column/models/column-config/column-config.model';
import {TimePeriodConstants} from '../date/constants';
import {CoreDefinitionStore} from '../definition/core-definition.store';
import {ColumnDefinition} from '../definition/models/column-definition.model';
import {PraadaCannedAttributionMethod} from '../definition/models/praada-meta-data/praada-canned-attribution-method.model';
import {PraadaFactor} from '../definition/models/praada-meta-data/praada-factor.model';
import {PerformanceSettings} from './models/performance-settings/performance-settings.model';
import {PerformanceConstants} from './performance.constants';

// @dynamic
export class ReturnsUtilityService {
    static currentColumnSubject: BehaviorSubject<ColumnConfig[]> = new BehaviorSubject<ColumnConfig[]>([]);

    static updateColumnList(columnSet: ColumnConfig[]) {
        ReturnsUtilityService.currentColumnSubject.next(columnSet);
    }

    static getCurrentColumnList$(): Observable<ColumnConfig[]> {
        return ReturnsUtilityService.currentColumnSubject.asObservable();
    }

    /**
     * Get full blown canned attribution method object from its key value
     */
    static getPraadaCannedMethodFromValue(value: string): PraadaCannedAttributionMethod {
        const listOfAttributionMethods: PraadaCannedAttributionMethod[] = CoreDefinitionStore.praadaCannedAttributionMethods;
        return listOfAttributionMethods.find((method: PraadaCannedAttributionMethod) => {
            return value === method.name;
        });
    }

    /**
     * Add factor columns based on the canned method passed in
     */
    static addFactorColumns(cannedMethod: string, columns: ColumnConfig[], factors: string[]): void {
        const factorsToUse = cannedMethod === PerformanceConstants.CUSTOM ? factors : ReturnsUtilityService.getPraadaCannedMethodFromValue(cannedMethod).excessMethodologies[0].factors;
        ReturnsUtilityService.addFactorsColumnsForGivenFactors(factorsToUse, columns);
        ReturnsUtilityService.addActiveBetColumnIfNeeded(cannedMethod, columns);
    }

    /**
     * Get the corresponding active factor tags for the given factor tags passed in
     */
    static getActiveFactorTagsFromFactorTags(factorTags: string[]): string[] {
        const factors: PraadaFactor[] = CoreDefinitionStore.attributionFactors.concat(CoreDefinitionStore.accountingFactors).concat(CoreDefinitionStore.tradeBasedFactors);
        const activeFactorTags: string[] = [];
        factorTags.forEach(factorTag => {
            const factorObj: PraadaFactor = find(factors, {value: factorTag});
            // check if it is non null and not undefined then add its column tag in the active factor tags.
            if (!isNil(factorObj) && factorObj.activeColumnTag) {
                activeFactorTags.push(factorObj.activeColumnTag);
            }
        });
        return activeFactorTags;
    }

    /**
     * Add Factor columns for the factors passed in to the columns set passed in
     */
    static addFactorsColumnsForGivenFactors = function (factorsToAdd: string[], columns: ColumnConfig[]): void {
        // Get all the factor columns
        const factors: PraadaFactor[] = CoreDefinitionStore.attributionFactors.concat(CoreDefinitionStore.accountingFactors).concat(CoreDefinitionStore.tradeBasedFactors);

        for (const factor of factors) {
            // If factor is not part of this canned setting skip it
            if (factorsToAdd.indexOf(factor.value) === -1) {
                continue;
            }
            ReturnsUtilityService.addColumn(factor.activeColumnTag, columns);
        }
    };

    static addActiveBetColumnIfNeeded(cannedMethod: string, columns: ColumnConfig[]): void {
        if (cannedMethod !== PerformanceConstants.OAS_CHG_DXS && cannedMethod !== PerformanceConstants.OAS_CHG_SPREAD_DURATION && cannedMethod !== PerformanceConstants.OAS_CHG_MARKET_VALUE) {
            return;
        }

        ReturnsUtilityService.addColumn(PerformanceConstants.ACTIVE_BET, columns);
    }

    /**
     * Create column from the colTag and add it to the list
     */
    static addColumn(colTag: string, columns: ColumnConfig[]): void {
        const col: ColumnDefinition = CoreColumnUtils.getColumnDefByTag(colTag);
        if (!col) {
            return;
        }

        const column: ColumnConfig = ColumnConfig.createColumnFromColumnDefinition(col);
        // AddOnly if the column is not present in the columns list coming in
        if (!find(columns, {columnTag: column.columnTag})) {
            columns.push(column);
            ReturnsUtilityService.updateColumnList(columns);
        }
    }

    /**
     * Remove time period from RA widget columns
     * we don't allow user to override them on column level in case of RA widget
     * but they still propagate down as column options because of the performance settings hierarchy
     */
    static removeTimePeriodFromColumnOptions(requestParams: any): void {
        // Remove time period column options
        requestParams.forEach(requestParam => {
            const columns: any[] = requestParam.columns;
            columns.forEach(col => {
                const optionValues: any = col.optionValues;
                if (!optionValues) {
                    return;
                }
                if (!isUndefined(optionValues[TimePeriodConstants.START_DATE])) {
                    delete optionValues[TimePeriodConstants.START_DATE];
                }
                if (!isUndefined(optionValues[TimePeriodConstants.END_DATE])) {
                    delete optionValues[TimePeriodConstants.END_DATE];
                }
                if (!isUndefined(optionValues[TimePeriodConstants.TIME_PERIOD])) {
                    delete optionValues[TimePeriodConstants.TIME_PERIOD];
                }
                if (!isUndefined(optionValues[TimePeriodConstants.NUMBER_OF_PERIODS])) {
                    delete optionValues[TimePeriodConstants.NUMBER_OF_PERIODS];
                }
            });
        });
    }

    /**
     * Remove redundant attribution setting defined at column level in request params if the actual column didn't have it overridden
     */
    static removeRedundantAttributionSettingsFromColumnOptions(requestParams: any, columns: ColumnConfig[]): void {
        requestParams.forEach(requestParam => {
            const requestColumns: any[] = requestParam.columns;
            columns.forEach(col => {
                const performanceSettings = col.getOptionValueByConfigType(PerformanceSettings.CONFIG_TYPE) as PerformanceSettings;
                if (isUndefined(performanceSettings)) {
                    return;
                }
                if (performanceSettings.attributionSettings.isSettingDefinedAtThisLevel()) {
                    return;
                }
                const requestCol = requestColumns.find((reqCol: any) => {
                    return reqCol.columnKey === col.columnKey;
                });
                const optionValues: any = requestCol ? requestCol.optionValues : null;
                if (!optionValues) {
                    return;
                }
                ReturnsUtilityService.removeRedundantAttributionSettings(optionValues);
            });
        });
    }

    static removeRedundantAttributionSettings(requestParams: any): void {
        if (!isUndefined(requestParams[PerformanceConstants.ATTRIBUTION_METHOD])) {
            delete requestParams[PerformanceConstants.ATTRIBUTION_METHOD];
        }
        if (!isUndefined(requestParams[PerformanceConstants.FACTORS])) {
            delete requestParams[PerformanceConstants.FACTORS];
        }
        if (!isUndefined(requestParams[PerformanceConstants.SECTOR_WEIGHTING])) {
            delete requestParams[PerformanceConstants.SECTOR_WEIGHTING];
        }
        if (!isUndefined(requestParams[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD])) {
            delete requestParams[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD];
        }
        if (!isUndefined(requestParams[PerformanceConstants.SECTOR_LEVEL])) {
            delete requestParams[PerformanceConstants.SECTOR_LEVEL];
        }
        if (!isUndefined(requestParams[PerformanceConstants.ASSET_TYPE])) {
            delete requestParams[PerformanceConstants.ASSET_TYPE];
        }
        if (!isUndefined(requestParams[PerformanceConstants.EXPOSURE_MODE])) {
            delete requestParams[PerformanceConstants.EXPOSURE_MODE];
        }
        if (!isUndefined(requestParams[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH])) {
            delete requestParams[PerformanceConstants.IS_TOP_DOWN_WITHOUT_LOOKTHROUGH];
        }
        if (!isUndefined(requestParams[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION])) {
            delete requestParams[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION];
        }
    }
}
