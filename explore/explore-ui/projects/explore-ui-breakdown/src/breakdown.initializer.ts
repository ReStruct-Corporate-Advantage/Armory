import {ConfigTypeFactory, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSector} from './models/sector/column-sector/column-sector.model';
import {ColumnSectorRule} from './models/sector/column-sector/column-sector-rule.model';
import {DateColumnSector} from './models/sector/column-sector/date-column-sector.model';
import {LinkedFavoriteSector} from './models/sector/linked-favorite-sector.model';
import {TimeSpanColumnSector} from './models/sector/column-sector/time-span-column-sector.model';
import {GroupRule} from './models/sector/group-rule.model';
import {CustomSector} from './models/sector/custom-sector/custom-sector.model';
import {CustomSectorRule} from './models/sector/custom-sector/custom-sector-rule.model';
import {NumericColumnSector} from './models/sector/column-sector/numeric-column-sector.model';
import {QuantileInfo} from './models/sector/column-sector/quantile-info.model';
import {Breakdown} from './models/breakdown/breakdown.model';
import {SectorRuleInfoFactory} from './factories/sector-rule-info.factory';
import {SectorRuleInfo} from './models/sector/sector-rule-info.model';
import {CustomSectorRuleInfo} from './models/sector/custom-sector/custom-sector-rule-info.model';
import {SectorConstants} from './constants/sector.constants';
import {CustomFilter} from './models/filter/custom-filter.model';
import {NormalizedFlag} from './models/normalized-flag/normalized-flag.model';
import {SchemaSector} from './models/sector/schema-sector/schema-sector.model';

/**
 * Initialize all the sector related config types
 */
export class BreakdownInitializer {

    static initializeConfig(): void {
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
        BreakdownInitializer.registerSectorRuleInfoTypes();
        BreakdownInitializer.registerCustomFilterConfigTypes();
        BreakdownInitializer.registerNormalizedFlagConfigTypes();
    }

    /**
     * Initialize all the sector related config types
     */
    static registerSectorConfigTypes() {
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.COLUMN_SECTOR, ColumnSector);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.COLUMN_SECTOR_RULE, ColumnSectorRule);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.CUSTOM_SECTOR, CustomSector);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.CUSTOM_SECTOR + '_sector', CustomSector);
        ConfigTypeFactory.registerConfigType('CUSTOM_SEC', CustomSector);
        ConfigTypeFactory.registerConfigType('CUSTOM_SECTOR', CustomSector);
        ConfigTypeFactory.registerConfigType('FACT_CUSTOM_SEC', CustomSector);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.CUSTOM_SECTOR_RULE, CustomSectorRule);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.DATE_COLUMN_SECTOR, DateColumnSector);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.GROUP_RULE, GroupRule);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.NUMERIC_COLUMN_SECTOR, NumericColumnSector);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.TIME_SPAN_COLUMN_SECTOR, TimeSpanColumnSector);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.LINKED_FAVORITE_SECTOR, LinkedFavoriteSector);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.SCHEMA_SECTOR, SchemaSector);
    }

    /**
     * Initialize all the breakdown related config types
     */
    static registerBreakdownConfigTypes() {
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.BREAKDOWN, Breakdown);
        ConfigTypeFactory.registerConfigType('FAC_BKD', Breakdown);
        ConfigTypeFactory.registerConfigType('BREAKDOWN', Breakdown);
        ConfigTypeFactory.registerConfigType('breakdownTree', Breakdown);
        ConfigTypeFactory.registerConfigType('stackedBreakdownTree', Breakdown);
        ConfigTypeFactory.registerConfigType('columnBreakdownTree', Breakdown);
        ConfigTypeFactory.registerConfigType('cellBreakdownTree', Breakdown);
        ConfigTypeFactory.registerConfigType('riskFactorBreakdown', Breakdown);
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.QUANTILE_INFO, QuantileInfo);
    }

    /**
     * Initialize sector rule info config types
     */
    static registerSectorRuleInfoTypes() {
        SectorRuleInfoFactory.registerSectorRuleInfoType(SectorConstants.SECTOR_RULES_INFO.NORMAL_SECTOR, SectorRuleInfo);
        SectorRuleInfoFactory.registerSectorRuleInfoType(SectorConstants.SECTOR_RULES_INFO.CUSTOM_SECTOR, CustomSectorRuleInfo);
    }

    /**
     * Initialize custom filer config types
     */
    static registerCustomFilterConfigTypes() {
        ConfigTypeFactory.registerConfigType(CustomFilter.CONFIG_TYPE, CustomFilter);
        ConfigTypeFactory.registerConfigType('filter', CustomFilter);
        ConfigTypeFactory.registerConfigType('securityConstraintFilter', CustomFilter);
    }

    /**
     * Initialize normalized flag config types
     */
    static registerNormalizedFlagConfigTypes() {
        ConfigTypeFactory.registerConfigType(WidgetInputType.NORMALIZED_FLAG, NormalizedFlag);
        ConfigTypeFactory.registerConfigType(NormalizedFlag.NORMALIZED_WIDGET_FILTER, NormalizedFlag);
    }
}
