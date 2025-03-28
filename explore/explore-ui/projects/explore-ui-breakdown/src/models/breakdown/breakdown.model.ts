import {cloneDeep, isEmpty, isEqual, isObject, isUndefined} from 'lodash';
import {Sector} from '../../interfaces/sector.interface';
import {ColumnSector} from '../sector/column-sector/column-sector.model';
import {DateColumnSector} from '../sector/column-sector/date-column-sector.model';
import {SectorUtils} from '../../utils';
import {TimeSpanColumnSector} from '../sector/column-sector/time-span-column-sector.model';
import {NumericColumnSector} from '../sector/column-sector/numeric-column-sector.model';
import {LinkedFavoriteSector} from '../sector/linked-favorite-sector.model';
import {SectorConstants} from '../../constants/sector.constants';
import {
    AbstractConfig,
    AbstractFavoriteConfig,
    ColumnConstants,
    CoreColumnUtils,
    CoreCommonConstants,
    FavoriteDisplayEnum,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType,
    WidgetTitleModifiable
} from '@blk/explore-ui-core';
import {SchemaSector} from '../sector/schema-sector/schema-sector.model';
import {MultiManagerBreakdownUtils} from '../../utils/multi-manager-breakdown.utils';

/**
 * Class for the breakdown settings.
 */
export class Breakdown extends AbstractFavoriteConfig implements Sector, WidgetInput, WidgetTitleModifiable, RequestParamsCreator {
    text: string;
    parent: Sector;
    children: Sector[] = [];
    // flag to indicate 'configurable breakdown' selected in UI
    isConfigured: boolean;

    // id that is set if a preset breakdown is selected (ex. IAA)
    // indicates that breakdown is portfolio-specific and should be resolved on the backend
    presetBreakdownId?: string;

    // flag to indicate if the breakdown should be set based on the breakdown set in mandate
    isMandateDefaultBreakdown = false;

    isTopBottomSectoring = false;
    displayAtGroupNode = false;

    /**
     * Returns the default breakdown to be used.
     */
    static getDefaultBreakdown(): Breakdown {
        const breakdown: Breakdown = new Breakdown();
        breakdown.title = 'Security Group';

        const sector: ColumnSector = new ColumnSector();
        sector.columnTag = 'sec_group';
        sector.columnName = 'Security Group';
        sector.positionColumnType = 'ALL';
        breakdown.addChild(sector);

        return breakdown;
    }

    /**
     *  returns the default factor breakdown
     */
    static getDefaultFactorBreakdown(): Breakdown {
        const sector: ColumnSector = new ColumnSector();
        sector.columnTag = 'BRS_GOLD_5';
        sector.columnName = 'BRS Standard Factor Tree Level 1';
        sector.positionColumnType = 'ALL';

        const breakdown: Breakdown = new Breakdown();
        breakdown.title = 'BRS Standard Factor Tree Level 1';
        breakdown.addChild(sector);
        return breakdown;
    }

    /**
     * Recursive function used to strip the breakdown to the required level.
     */
    static stripChildren(sector: Sector, requestedLevels: number, level: number): void {
        // If we have hit the level to strip at then remove the children and get out of here.
        if (level === requestedLevels) {
            sector.children = [];
            if (sector instanceof LinkedFavoriteSector && sector.sector) {
                sector.sector.children = [];
            }
            return;
        }

        // Recursively call this for all the children.
        sector.children.forEach((child: Sector) => {
            Breakdown.stripChildren(child, requestedLevels, level + 1);
        });
    }

    /**
     * Finds all the leaf level sectors in the breakdown.
     */
    static findLeafSectors(sector: Sector, leafSectors: Sector[]): void {
        if (!sector.children || sector.children.length === 0) {
            leafSectors.push(sector);
            return;
        }

        sector.children.forEach((child: Sector) => {
            Breakdown.findLeafSectors(child, leafSectors);
        });
    }

    /**
     * Finds all quantile sectors in the passed in sector
     * Recursively traverses through child nodes
     */
    static getQuantileSectors(sector: Sector, quantileSectors: Sector[]): void {
        if (sector instanceof NumericColumnSector && sector.isQuantile()) {
            quantileSectors.push(sector);
        }

        sector.children?.forEach((child: Sector) => {
            Breakdown.getQuantileSectors(child, quantileSectors);
        });
    }

    /**
     *
     * @param breakdown a breakdown to deep clone and strip to the first level
     * @param levelToStripTo a level to strip to (optional)
     * @return a deep clone of the given breakdown. It will also be stripped to the specified level if the level
     * parameter is given
     */
    static deepCloneAndOptionalStripToSpecifiedLevel(breakdown: Breakdown, levelToStripTo?: number): Breakdown {
        const deepClonedBreakdown = cloneDeep(breakdown);
        if (!isUndefined(levelToStripTo)) {
            deepClonedBreakdown.stripChildrenToLevel(levelToStripTo);
        }

        return deepClonedBreakdown;
    }

    /**
     * Sets "Include None Bucket" flag to the given isIncludeNoneBucket flag on all of given sectors and their descendants
     * @param sectors sectors to set the flag on
     * @param isIncludeNoneBucket true or false
     */
    static setIncludeNoneBucket(sectors: Sector[], isIncludeNoneBucket: boolean): void {
        sectors.forEach(function (sector: Sector) {
            if (sector instanceof ColumnSector) {
                sector.useNoneBuckets = isIncludeNoneBucket;
            }

            if (sector.children) {
                Breakdown.setIncludeNoneBucket(sector.children, isIncludeNoneBucket);
            }
        });
    }

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type.
     */
    get configType(): string {
        return SectorConstants.ConfigType.BREAKDOWN;
    }

    /**
     * Get the sectorRuleType
     */
    get sectorRuleType(): string {
        return 'Breakdown';
    }

    /**
     * Adds a child sector to this sector.
     */
    addChild(child: Sector): void {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    /**
     * Get the child sector of a breakdown at a given index
     * Returns false if a sector doesn't exist at the index
     */
    getChildSectorAtIndex(index: number): boolean | Sector {
        if (index >= this.children.length) {
            return false;
        }
        return this.children[index];
    }

    /**
     * Check if breakdown is an empty object or not.
     */
    isEmpty(): boolean {
        return (!this.children || this.children.length < 1) && !this.isMandateDefaultBreakdown;
    }

    /**
     * Checks if a breakdown is a single-level breakdown
     */
    isSingleLevel(): boolean {
        // Can't be single level if it is empty.
        if (this.isEmpty()) {
            return false;
        }

        // Can only have 1 child.
        if (this.children.length !== 1) {
            return false;
        }

        // Grab out the sector
        const sector: Sector = this.children[0];
        // The sector should not have any children
        return !sector.children || sector.children.length < 1;
    }

    /**
     * Checks if a breakdown is a simple single-level breakdown
     * Considered simple single-level if there is only one Sector that is a ColumnSector
     */
    isSimpleSingleLevel(): boolean {
        // Check if it passes normal single level check
        if (!this.isSingleLevel()) {
            return false;
        }

        // Grab out the sector and make sure that it is a simple ColumnSector and not any of the derived columns.
        const sector: Sector = this.children[0];

        // Has to be a column sector to be supported here.
        if (!(sector instanceof ColumnSector)) {
            return false;
        }

        // also we do not support date, time span or numeric implementations of this.
        return !(sector instanceof TimeSpanColumnSector || sector instanceof DateColumnSector || sector instanceof NumericColumnSector);
    }

    /**
     * Check if breakdown belongs in the quick select
     */
    isQuickSelectBreakdown(): boolean {
        return this.isMandateDefaultBreakdown || this.isSimpleSingleLevel();
    }

    /**
     * Method to check if Breakdown has portfolio name column in breakdown tree
     */
    hasPortfolioNameColumn(): boolean {
        const coltag: string[] = [ColumnConstants.PORTFOLIO_NAME, ColumnConstants.PORTFOLIO_FULL_NAME];
        return this.children.length > 0 && this.checkForSpecifiedColumn(this.children, coltag, false);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Method to check if Breakdown has GRSector column in breakdown tree.
     */
    hasGRSectorColumn(): boolean {
        const coltag: string[] = [ColumnConstants.GRSECTOR];
        return this.children.length > 0 && this.checkForSpecifiedColumn(this.children, coltag, true);
    }

    /**
     * Checks if the breakdown has more than one level in it.
     */
    isMultiLevel(): boolean {
        // Can't be multi level if it is empty.
        if (this.isEmpty()) {
            return false;
        }

        // Go through the children and make sure that they all have no children.
        return !this.children.every((child: Sector) => {
            return !child.children || child.children.length === 0;
        });
    }

    /**
     * Appends the breakdown passed in to the current breakdown.
     */
    append(breakdown: Breakdown): void {
        // Find all the leaf nodes of this breakdown.
        const leafSectors: Sector[] = [];
        Breakdown.findLeafSectors(this, leafSectors);

        // Now append the breakdown sectors to them.
        leafSectors.forEach((sector: Sector) => {
            if (!sector.children) {
                sector.children = [];
            }
            sector.children = sector.children.concat(breakdown.children);
        });
    }

    /**
     * Strips the breakdown to only the number of levels requested.
     */
    stripChildrenToLevel(level: number): void {
        Breakdown.stripChildren(this, level, 0);
    }

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean {
        // TODO:  For now the code path that is accessing this is not calling this so just assume true for now.
        // This will need to loop through the tree and ensure that all nodes of the tree are actually valid.
        return true;
    }

    /**
     * Gets the display title for the breakdown.
     */
    getDisplayTitle(): string {
        // If this breakdown has an actual title then just return that.
        if (this.title) {
            return this.title;
        }

        // If there are no children then return an empty string.
        if (!this.children || this.children.length === 0) {
            return '';
        }

        // Now we need to create a title based of the contents of the breakdown.
        return this.generateTitle(this.children);
    }

    /**
     * Set the title of the breakdown given its contents
     */
    setDefaultTitle(): string {
        if (this.isEmpty()) {
            // If the breakdown is empty, just leave it as empty string
            this.title = '';
        } else if (this.isSingleLevel()) {
            // If it's single level, check to see what type it is and create a name
            const sector: Sector = this.children[0];
            if (sector instanceof LinkedFavoriteSector) {
                this.title = '<' + sector.sector.title + '>';
            } else {
                this.title = '<' + (sector as ColumnSector).columnName + '>';
            }
        } else {
            // Anything else, then just give it a default untitled title
            this.title = '<Untitled>';
        }

        return this.title;
    }

    /**
     * Function checks if passed breakdown is a GR Sector breakdown only
     */
    isGRSectorBreakdownOnly(breakdownColTags?: Set<string>): boolean {
        breakdownColTags = breakdownColTags ? breakdownColTags : new Set<string>();
        const columnSector: ColumnSector = this.children[0] as ColumnSector;
        if (!columnSector.columnTag) {
            return false;
        }

        return columnSector.isGRSectorOnly(breakdownColTags);
    }

    /**
     * See WidgetInput.isDataStoreInput
     * @return true
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * See WidgetInput.equals
     * @param widgetInput widgetInput to compare against
     * @return true if it equals given widget input, otherwise false.
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof Breakdown)) {
            return false;
        }

        if (this.presetBreakdownId || widgetInput.presetBreakdownId) {
            return this.presetBreakdownId === widgetInput.presetBreakdownId;
        }

        if (this.isMandateDefaultBreakdown || widgetInput.isMandateDefaultBreakdown) {
            return this.isMandateDefaultBreakdown === widgetInput.isMandateDefaultBreakdown;
        }

        if (this.isTopBottomSectoring !== widgetInput.isTopBottomSectoring) {
            return false;
        }

        if (this.displayAtGroupNode !== widgetInput.displayAtGroupNode) {
            return false;
        }

        return SectorUtils.isEqual(this, widgetInput);
    }

    /**
     * See RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        const paramNameToUse = paramName ? paramName : WidgetInputType.BREAKDOWN_TREE;
        requestParams[paramNameToUse] = JSON.stringify(this.serialize());
        requestParams.isTopBottomSectoring = this.isTopBottomSectoring;
        requestParams.isDisplayAtGroupNode = this.displayAtGroupNode;

        // decision benchmark data specific breakdown params
        if(requestParams.isDecisionLevelData){
            const breakdown = MultiManagerBreakdownUtils.createBreakdownTreeForDecisionBenchData(requestParams.portTreeDecisionLevel, requestParams.topDownCols);
            requestParams[paramNameToUse] = JSON.stringify(breakdown.serialize());
            requestParams.isTopBottomSectoring = true;
        }
    }

    /**
     * @return true if it has children, otherwise false.
     */
    hasChildren(): boolean {
        return this.children.length > 0;
    }

    /**
     * @inheritDoc
     */
    getTitle(): string {
        return this.title;
    }

    /**
     * @inheritDoc
     */
    getDataType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.BREAKDOWN;
    }

    /**
     * Gets the favorite type for this config.
     */
    getConfigType(): string {
        return SectorConstants.ConfigType.BREAKDOWN;
    }

    /**
     * getting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        if (this.isConfigured) {
            return { columnTag: 'Configured Breakdown' };
        } else if (this.children.length > 0) {
            return { columnTag: (this.children[0] as ColumnSector).columnTag };
        } else {
            return { columnTag: '' };
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    protected doSerialize(isNested: boolean | SerializeFavoriteType): any {
        // TODO:  Should we think about removing this wrapper breakdown tag?
        const data: any = {};
        data.breakdown = {};

        // Check to see if this serialize request is for saving
        // We only want to send it to ExploreServer for serializing a save and not a data request
        // We are only concerned with breakdowns that are being saved as a nested favorite
        // If the isNested flag is either true or the number 1 (AbstractFavoriteConfig.SERIALIZE_LINKED_FAV)
        // Then the config will be saved as a linked favorite
        if (isNested === true || isNested === SerializeFavoriteType.SERIALIZE_LINKED_FAV) {
            // Serialize the isConfigured flag
            data.breakdown.isConfigured = this.isConfigured;
        }

        // Not sure if we should do this or not, but it is part of the breakdown definition.
        if (this.title) {
            data.breakdown.breakdownTitle = this.title;
        }

        // Serialise the child nodes into the breakdown property.
        SectorUtils.serializeChildren(this, data.breakdown, isNested);

        if (this.presetBreakdownId) {
            data.presetBreakdownId = this.presetBreakdownId;
        }
        if (this.isMandateDefaultBreakdown) {
            data.isMandateDefaultBreakdown = this.isMandateDefaultBreakdown;
        }
        if (this.isTopBottomSectoring) {
            data.isTopBottomSectoring = this.isTopBottomSectoring;
        }
        if (this.displayAtGroupNode) {
            data.displayAtGroupNode = this.displayAtGroupNode;
        }

        return data;
    }

    /**
     * This function is used to deserialize the implementation favorite.
     */
    protected doDeserialize(data: any): void {
        // If there is a data element then check if the extra data is not null.
        if (!isUndefined(data.data) && data.data !== null) {
            data = data.data;
        }

        // Cater for old favorites where the custom sectors are loaded onto the root node.
        if (data.customSectors) {
            this.convertCustomSectors(data);
        }

        this.presetBreakdownId = data.presetBreakdownId;

        if (data.isMandateDefaultBreakdown) {
            this.isMandateDefaultBreakdown = data.isMandateDefaultBreakdown;
        }

        if (data.isTopBottomSectoring) {
            this.isTopBottomSectoring = data.isTopBottomSectoring;
        }

        if (data.displayAtGroupNode) {
            this.displayAtGroupNode = data.displayAtGroupNode;
        }

        if (data && data.breakdown) {
            // Deserialize the isConfigured flag
            // Cater for old favorites that do not have this flag saved and default it to true
            this.isConfigured = isUndefined(data.breakdown.isConfigured) ? true : data.breakdown.isConfigured;

            // Deserialize the child sectors into this instance.
            SectorUtils.deserializeChildren(this, data.breakdown);

            // A breakdown has a breakdownTitle inside the breakdown itself.
            // When favorite from PRISM is loaded we do have data.breakdown.title as undefined and breakdownTitle remains ''
            if (data.breakdown.breakdownTitle) {
                this.title = data.breakdown.breakdownTitle;
            } else if (data.title) {
                this.title = data.title;
            } else {
                this.title = this.setDefaultTitle();
            }
        } else if (data instanceof Breakdown && data.children) {   // if data is already deserialized, set the data(i.e. title, isConfigured and children) from data.
            this.title = data.title;
            this.isConfigured = data.isConfigured;
            this.children = data.children;
        }
    }

    /**
     * Function to copy the contents of another config object into this one.
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Breakdown)) {
            return;
        }

        this.children = source.children;

        this.presetBreakdownId = source.presetBreakdownId;
        this.isMandateDefaultBreakdown = source.isMandateDefaultBreakdown;
        this.isTopBottomSectoring = !!source.isTopBottomSectoring;
        this.displayAtGroupNode = !!source.displayAtGroupNode;
    }

    /**
     * This function will convert the custom sectors in the breakdown to the new style.
     */
    private convertCustomSectors(data: any): void {
        // Grab the reference to the custom sectors for easy access below.
        // NOTE:  This is an object where the keys are the sector ids from 1..n.
        const customSectors: any = data.customSectors;

        // Now we need to recursively go through the breakdown and add the custom sector
        // rule to any custom sector that we find.
        this.replaceCustomSectors(data.breakdown, customSectors);
    }

    /**
     * Updates the breakdown object to have the custom sectors in the correct place.
     */
    private replaceCustomSectors(sector: any, customSectors: any): void {
        // Skip out if there are no subSectors.
        if (!sector.subSectors || sector.subSectors.length === 0) {
            return;
        }

        sector.subSectors.forEach((subSector: any) => {
            // Only process if the sector is a custom sector and it has an id.
            if (SectorConstants.ConfigType.CUSTOM_SECTOR === subSector.breakdownRuleType && !isUndefined(subSector.id)) {
                const sectorDef: any = customSectors[subSector.id.toString()];
                if (sectorDef) {
                    if (sectorDef.sectorRule) {
                        subSector.rule = sectorDef.sectorRule;
                    }
                    if (sectorDef.sectorName) {
                        subSector.title = sectorDef.sectorName;
                    }
                }
            }

            // Recursively call to update all the sub sectors.
            this.replaceCustomSectors(subSector, customSectors);
        });
    }

    /**
     * Generates a title for the sectors.
     */
    private generateTitle(sectors: Sector[]): string {
        if (sectors.length > 1) {
            // For a complex sector definition we cannot generate a nice name.
            return 'Complex';
        }

        const sector: Sector = sectors[0];
        let title;
        if (sector instanceof ColumnSector) {
            title = sector.columnName;
        } else {
            title = 'Custom';
        }

        // Now if there are children add the child title to it.
        if (sector.children && sector.children.length > 0) {
            title += '\\' + this.generateTitle(sector.children);
        }

        return title;
    }


    /**
     * Check sector and subsector for specified column name.
     */

    private checkForSpecifiedColumn(columnSectors: Sector[], colTag: string[], checkStartsWith: boolean): boolean {
        if (isUndefined(columnSectors)) {
            return false;
        }

        for (let i = 0; i < columnSectors.length; i++) {
            const subSector: any = (columnSectors[i] as LinkedFavoriteSector).sector ? (columnSectors[i] as LinkedFavoriteSector).sector : columnSectors[i];
            const columnTag: string = subSector.rule ? subSector.rule.columnTag : subSector.columnTag;

            for (let j = 0; j < colTag.length; j++) {
                // Check if column is portfolio Name or portfolio full name
                if (subSector && columnTag && (isEqual(columnTag, colTag[j]) || (checkStartsWith && columnTag.startsWith(colTag[j])))) {
                    return true;
                }
            }

            // check if breakdown tree has children
            if (columnSectors[i].children && columnSectors[i].children.length > 0 && this.checkForSpecifiedColumn(columnSectors[i].children, colTag, checkStartsWith)) {
                return true;
            }
            // check if breakdown tree has sub rules for custom breakdown
            if (subSector.rule && subSector.rule.subRules && subSector.rule.subRules.length > 0 && this.checkForSpecifiedColumn(subSector.rule.subRules, colTag, checkStartsWith)) {
                return true;
            }

            // check if breakdown has groupRule in a groupRule
            if (subSector && subSector.subRules && subSector.subRules.length > 0 && this.checkForSpecifiedColumn(subSector.subRules, colTag, checkStartsWith)) {
                return true;
            }
        }
    }

    /**
     * Validate the breakdown passed is Performance breakdown
     */
    isPerformanceBreakdown(): boolean {
        if (this.isEmpty()) {
            return true;
        }

        const sector: ColumnSector = this.children[0] as ColumnSector;
        if (this.children.length > 1 || !sector.columnTag) {
            return false;
        }

        return CoreColumnUtils.getColumnDefByTagAndUse(sector.columnTag, sector.positionColumnType).praadaBreakdown;
    }

    /**
     * Validate if breakdown is macro factor
     */
    isMacroFactorBreakdown(): boolean {
        if (this.isEmpty() || this.children.length > 1 || !(this.children[0] as ColumnSector).columnTag) {
            return false;
        }
        const sector: ColumnSector = this.children[0] as ColumnSector;
        const colDef = CoreColumnUtils.getColumnDefByTagAndUse(sector.columnTag, sector.positionColumnType);
        return colDef && colDef.isMacroFactor;
    }

    /**
     * WidgetTitleModifiable.getModifiedWidgetTitleDetails(DateValue)
     */
    getModifiedWidgetTitleDetails(): any {
        return this.isEmpty() ? CoreCommonConstants.EMPTY_STRING : this.getDisplayTitle() + ' x ';
    }

    /**
     * Checks if a breakdown is a placeholder (will get resolved on the backend)
     */
    isPlaceholderBreakdown(): boolean {
        return !!this.presetBreakdownId || this.isMandateDefaultBreakdown;
    }

    isSchemaBreakdown(): boolean {
        return this.children?.[0] instanceof SchemaSector;
    }

    getDisplayType(parent?: AbstractConfig): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.BREAKDOWN;
    }

    /**
     * Checks if any of the underlying sectors of the Breakdown has quantiles
     */
    hasQuantiles(): boolean {
        const quantiles: Sector[] = [];
        for (const childSector of this.children) {
            Breakdown.getQuantileSectors(childSector, quantiles);
        }
        return !isEmpty(quantiles);
    }
}
