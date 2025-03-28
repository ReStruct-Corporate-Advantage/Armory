import {Injectable} from '@angular/core';
import {AttributionSettings, ColumnConfig, CoreColumnUtils, CoreDefinitionStore, PerformanceAttributionSettingsServiceInterface, PerformanceConstants, PraadaFactor, ReturnsUtilityService} from '@blk/explore-ui-core';
import {ColumnSetService} from '@services/column-set/column-set.service';
import {find, isNil} from 'lodash';

/**
 * Helper class for Attribution Settings Component
 */
@Injectable({
    providedIn: 'root'
})
export class PerformanceAttributionSettingsService implements PerformanceAttributionSettingsServiceInterface {

    // portfolioAssetType to hold portfolio context to get attribution information from it for AttributionSettingsComponent
    static portfolioAssetType: string;

    private readonly CANNED_METHOD_CUSTOM = 'CUSTOM';

    constructor(private columnSetService: ColumnSetService) {
    }

    /**
     * setAssetType
     */
    setAssetType(attributionSettings: AttributionSettings): void {
        // If no canned setting is set default to the portfolio's asset type
        if (!attributionSettings.cannedMethod) {
            attributionSettings.assetType = PerformanceAttributionSettingsService.portfolioAssetType;
            // In case if custom asset type would have been saved when user selected custom
        } else if (attributionSettings.cannedMethod === PerformanceConstants.CANNED_METHOD.DEFAULT) {
            attributionSettings.assetType = 'BAL_MANDATE';
        } else if (attributionSettings.cannedMethod !== this.CANNED_METHOD_CUSTOM) {
            // Extract asset type from the canned setting
            const attributionMethod = CoreDefinitionStore.praadaCannedAttributionMethods.filter(cannedAttriMethod => attributionSettings.cannedMethod === cannedAttriMethod.name)[0];
            attributionSettings.assetType = attributionMethod.assetClass;
        }
    }

    /**
     * [Explore specific] used for widget level ONLY
     * fetchColumnData$
     */
    fetchColumnData$(columns: ColumnConfig[], callback: () => void): void {
        columns.splice(0, columns.length);
        this.columnSetService.fetchColumnData$(PerformanceConstants.ENHANCED_BRINSON_REPORT)
            .subscribe(payload => {
                payload.map(column => ColumnConfig.createColumnFromColumnDefinition(CoreColumnUtils.getColumnDefByTagAndUse(column.columnTag, column.uses)))
                    .forEach(column => columns.push(column));
                callback();
            });
    }

    /**
     * [Explore specific] used for widget level ONLY
     * modifyColumns
     */
    modifyColumns(columns: ColumnConfig[], allFactorColumns: string[], factorsToAdd: string[], cannedMethod: string): void {
        // First get rid of the factor columns which are no longer valid as per the new attribution setting. We only get rid of the columns that are no longer needed  so that the order of the columns still needed is maintained
        this.removeFactorColumns(columns, allFactorColumns, ReturnsUtilityService.getActiveFactorTagsFromFactorTags(factorsToAdd));

        // Now get the filtered list of factors to add based on what is already present in the columns list
        const filteredFactorsToAdd: string[] = this.getFilteredFactorTagsToAdd(columns, factorsToAdd);

        // Then add the appropriate factor columns
        ReturnsUtilityService.addFactorsColumnsForGivenFactors(filteredFactorsToAdd, columns);

        ReturnsUtilityService.addActiveBetColumnIfNeeded(cannedMethod, columns);
    }

    /**
     * Remove the factor columns from the input columns as they would be updated as per the new canned method chosen. But we need to retain the activeFactorTagsToBeAdded as they are still needed as per the new canned method chosen
     */
    private removeFactorColumns(columns: ColumnConfig[], allFactorColumns: string[], activeFactorTagsToBeAdded: string[]) {
        if (columns.length === 0) {
            return;
        }

        let filteredColsList = columns.filter((column) => {
            // We need either the non active factor columns or the ones which still are valid and are present in the activeFactorTagsToBeAdded list
            return allFactorColumns.indexOf(column.columnTag) === -1 || activeFactorTagsToBeAdded.indexOf(column.columnTag) !== -1;
        });

        // Also remove the Active Bet column
        filteredColsList = filteredColsList.filter((column) => {
            return column.columnTag !== PerformanceConstants.ACTIVE_BET;
        });

        // Still maintain the reference and just empty the list then add all the filtered ones back in
        columns.splice(0, columns.length);
        filteredColsList.forEach(column => {
            columns.push(column);
        });
    }

    /**
     * Filter the factors list passed on based in what is already present in the columns
     */
    private getFilteredFactorTagsToAdd(columns: ColumnConfig[], factorsToAdd: string[]) {
        const factors: PraadaFactor[] = (CoreDefinitionStore.attributionFactors.concat(CoreDefinitionStore.accountingFactors)).concat(CoreDefinitionStore.tradeBasedFactors);
        const filteredFactorsToAdd = [];
        factorsToAdd.forEach(factor => {
            let factorAlreadyPresent = false;
            for (const column of columns) {
                // Check for the active tag of the factor as columns contains the active tag
                const factorObj: any = find(factors, {value: factor});
                if (!isNil(factorObj) && column.columnTag === factorObj.activeColumnTag) {
                    factorAlreadyPresent = true;
                    break;
                }
            }
            // If factor is not already present then add to the list of filtered factors to add
            if (!factorAlreadyPresent) {
                filteredFactorsToAdd.push(factor);
            }
        });
        return filteredFactorsToAdd;
    }
}
