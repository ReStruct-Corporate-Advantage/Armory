import {ColumnConfig} from '../../column/models/column-config/column-config.model';
import {AttributionSettings} from '../models/attribution-settings/attribution-settings.model';

/**
 * PerformanceAttributionSettingsServiceInterface
 * Library Consumers need to implement this interface and provide the token: PERFORMANCE_ATTRIBUTION_SETTINGS_SERVICE_TOKEN
 */
export interface PerformanceAttributionSettingsServiceInterface {

    /**
     * Setting default asset type to 'BAL_MANDATE' (Multi asset) by default
     * => attributionSettings.assetType = 'BAL_MANDATE';
     */
    setAssetType(attributionSettings: AttributionSettings): void;

    /**
     * [Explore specific] used for widget level ONLY
     * fetchColumnData$
     */
    fetchColumnData$(columns: ColumnConfig[], callback: () => void): void;

    /**
     * [Explore specific] used for widget level ONLY
     * modifyColumns
     */
    modifyColumns(columns: ColumnConfig[], allFactorColumns: string[], factorsToAdd: string[], cannedMethod: string): void;
}
