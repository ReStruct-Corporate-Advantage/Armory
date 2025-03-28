import {
    AbstractFavoriteConfig,
    CoreFavoriteUtils,
    DateValue,
    Favorite,
    FavoriteDisplayEnum,
    ResponseData,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {ExploreResponseConfig} from '@interfaces/response.interface';
import {Portfolio} from './portfolio.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {HoldingChange} from './composition/holding-change.model';
import {BaseRule} from './tradeRules/base-rule.model';
import {cloneDeep, isEmpty, isEqual, partition} from 'lodash';
import {CompositionSetting} from './composition/composition-setting.model';
import {PortfolioSecurityHoldingChange} from './composition/portfolio-security-holding-change.model';
import {IndexWeight} from './index-weight.model';
import {CompositionConstants} from '../../constants';
import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {
    PortfolioNavSecurityHoldingChange
} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';

/**
 * What if portfolio base class
 */
export class WhatIfPortfolio extends Portfolio {

    composition: ExploreResponseConfig & {data: ResponseData};
    compositionConfig: CompositionConfig;
    compositionSetting: CompositionSetting = new CompositionSetting();
    modellingType: ModellingType;
    skippedRulesForEachDate: BaseRule[] = [];
    passedRulesForEachDate: BaseRule[] = [];
    holdingChanges: HoldingChange[] = [];
    holdingChangesGeneratedForAddedSecurities: HoldingChange[] = [];
    parentPortfolio: Portfolio;

    /**
     * Constructor
     */
    constructor(ticker?: string, datePicker?: DateValue) {
        super(ticker, datePicker);
    }

    setModellingType(type: number) {
        switch (type) {
            case 0 :
                this.modellingType = ModellingType.SECTOR;
                break;
            case 1 :
                this.modellingType = ModellingType.POSITION;
                break;
            case 2 :
                this.modellingType = ModellingType.PORTFOLIO;
                break;
            case 3 :
                this.modellingType = ModellingType.EXPOSURE;
                break;
            default:
                console.warn('Invalid modeling type selected');
                break;
        }
    }

    /**
     * Creates a favorite object for this favorite.
     * Override description to ticker so that we can search for it when we get back slim favorites
     */
    createFavorite(type: string): Favorite {
        const fav = super.createFavorite(type);
        fav.description = this.getPortfolioName();
        return fav;
    }

    /**
     * Custom description for what if portfolios - portfolio name
     */
    protected getPortfolioName(): string {
        return this.portName;
    }

    /**
     * Checks if this object is equal to the object passed in by comparing the relevant attributes
     */
    equals(obj: AbstractFavoriteConfig): boolean {
        if (!(obj instanceof Portfolio)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        if (!(obj instanceof WhatIfPortfolio)) {
            return false;
        }

        if (this.compositionSetting.showActiveInComposition !== obj.compositionSetting.showActiveInComposition) {
            return false;
        }

        if (this.compositionSetting.tradingColumn !== obj.compositionSetting.tradingColumn) {
            return false;
        }

        if (!isEqual(this.compositionSetting.breakdownTree.serialize(), obj.compositionSetting.breakdownTree.serialize())) {
            return false;
        }

        return this.modellingType === obj.modellingType;
    }

    /**
     * clone changes in what-if portfolio level settings to original portfolio
     */
    cloneChangesInPortLevelSettings(sourcePortfolio: Portfolio): void {
        super.cloneChangesInPortLevelSettings(sourcePortfolio);
        if (sourcePortfolio instanceof WhatIfPortfolio) {
            this.compositionSetting = cloneDeep(sourcePortfolio.compositionSetting);
        }
    }

    /**
     * Checks if the composition is at portfolio level or not.
     * Returns true if portfolio is a port group or composite and composition breakdown is not specified.
     */
    isCompositionAtPortfolioLevel(): boolean {
        return this.modellingType === ModellingType.PORTFOLIO;
    }

    isFactorExposureBasedComposition(): boolean {
        return this.modellingType === ModellingType.EXPOSURE;
    }

    /**
     * Checks if the composition breakdown is applied or not.
     */
    isCompositionBreakdownSpecified(): boolean {
        return this.compositionSetting.breakdownTree && !this.compositionSetting.breakdownTree.isEmpty();
    }

    /**
     * This method adds request params for the whatIfPortfolio
     */
    addRequestParams(requestParams: any): void {
        super.addRequestParams(requestParams);
        const [initHoldingChanges, nonInitHoldingChanges] = partition(this.holdingChanges, (holdingChange => holdingChange.addedDuringWhatIfInitialization));
        // Add non-init holding changes and init holding changes that are not present in non-int array and also check for addedDuringWhatIfInitialization flag
        const holdingChangesForRequest = [...nonInitHoldingChanges, ...initHoldingChanges?.filter(holdingChange1 => !nonInitHoldingChanges?.some(holdingChange2 => (holdingChange1.lineItem === holdingChange2.lineItem && holdingChange1.addedDuringWhatIfInitialization === holdingChange2.addedDuringWhatIfInitialization)))];
        requestParams.holdingChanges = isEmpty(holdingChangesForRequest) ? undefined : holdingChangesForRequest.map(holdingChange => holdingChange.serialize());
    }

    /**
     * Function to add Holding changes to portfolio. This method will remove any existing holding changes based
     * on line item (cusip or portfolio) if any and then add new holding changes.
     */
    addHoldingChanges(holdingChanges: HoldingChange[]): void {
        this.holdingChanges = this.addHoldingChangesToContainer(holdingChanges, this.holdingChanges);
    }

    protected addHoldingChangesToContainer(holdingChanges: HoldingChange[], holdingChangesContainer: HoldingChange[]): HoldingChange[] {
        if (isEmpty(holdingChanges)) {
            return holdingChangesContainer;
        }

        holdingChangesContainer = holdingChangesContainer.filter(holdingChange => holdingChange.isChildChange || holdingChange.addedDuringWhatIfInitialization);
        holdingChanges.forEach(holdingChange => {
            holdingChangesContainer = holdingChangesContainer.filter(change => {
                if (holdingChange instanceof PortfolioNavSecurityHoldingChange && (change instanceof PortfolioNavSecurityHoldingChange || change instanceof NewSecurityHoldingChange)) {
                    if (change instanceof PortfolioNavSecurityHoldingChange) {
                        return !holdingChange.isEqual(change);
                    }
                    return true;
                } else if (holdingChange instanceof PortfolioSecurityHoldingChange && change instanceof PortfolioSecurityHoldingChange) {
                    return !(change.lineItem === holdingChange.lineItem && change.portfolioName === holdingChange.portfolioName && change.isNavNeutral === holdingChange.isNavNeutral && change.addedDuringWhatIfInitialization === holdingChange.addedDuringWhatIfInitialization);
                } else if (holdingChange instanceof PortfolioHoldingChange && change instanceof PortfolioHoldingChange) {
                    return !(change.lineItem === holdingChange.lineItem && change.id === holdingChange.id && change.addedDuringWhatIfInitialization === holdingChange.addedDuringWhatIfInitialization && change.replacementCount === holdingChange.replacementCount);
                } else {
                    return !(change.lineItem === holdingChange.lineItem && change.addedDuringWhatIfInitialization === holdingChange.addedDuringWhatIfInitialization);
                }
            });
            holdingChangesContainer.push(holdingChange);
        });

        return holdingChangesContainer;
    }

    /**
     * return true if all the holding changes present were added during intialization
     */
    hasOnlyInitHoldingChanges(): boolean {
        return !this.holdingChanges.some(holdingChange => !holdingChange.addedDuringWhatIfInitialization);
    }

    /**
     * add holding changes generated for added securities
     */
    addHoldingChangesForAddedSecurities(): void {
        const newSecurityHoldingChanges = this.holdingChanges.filter(holdingChange => holdingChange instanceof NewSecurityHoldingChange);
        if (isEmpty(this.holdingChangesGeneratedForAddedSecurities)) {
            this.holdingChangesGeneratedForAddedSecurities = newSecurityHoldingChanges;
        } else {
            this.holdingChangesGeneratedForAddedSecurities.push(...newSecurityHoldingChanges);
        }
    }

    /**
     * Remove Holding changes based on line item.
     */
    removeHoldingChangeBasedOnLineItem(lineItem: string): void {
        if (isEmpty(this.holdingChanges)) {
            return;
        }

        this.holdingChanges = this.holdingChanges.filter(holdingChange => holdingChange.lineItem !== lineItem);
    }

    /**
     * This adds any new portfolios added to a composite to the index weights
     */
    addNewPortfolioWeightsToCompositeIndexWeights(holdingChanges: HoldingChange[]): void {
        // Reset composite index weights before adding them all again
        this.resetCompositeIndexWeights();
        if (isEmpty(holdingChanges)) {
            return;
        }

        holdingChanges
            .filter(holdingChange => holdingChange instanceof NewPortfolioHoldingChange || holdingChange.getChangeType() === CompositionConstants.HOLDING_CHANGE_TYPES.NEW_PORTFOLIO)
            .forEach((holdingChange: NewPortfolioHoldingChange) => {
                this.indexWeights.push(new IndexWeight({
                    portfolio: {
                        ticker: holdingChange.getWithFavTitle(holdingChange.lineItem),
                        fullName: holdingChange.childPortfolioFullName
                    },
                    weight: holdingChange.changeInWeight / 100.0
                }));
            });
    }

    /**
     * This resets the composite index weights to the default of the composite
     */
    resetCompositeIndexWeights(): void {
        if (isEmpty(this.indexWeights)) {
            return;
        }

        this.indexWeights = this.indexWeights.filter(indexWeight => indexWeight.portfolioCode);
    }

    /**
     * Get the saved portfolio type for this portfolio if it is one
     */
    getSavedPortfolioType(): string {
        return this.id ? this.type : null;
    }

    /**
     * This method checks and returns if the portfolio is a position based portfolio
     */
    isPositionBasedPortfolio(): boolean {
        return this.getSavedPortfolioType() === CompositionConstants.PORT_WITH_POSITIONS.TYPE || this.getSavedPortfolioType() === 'PORT_WITH_POSITIONS';
    }

    /**
     * @return true if it has benchmark related rules in its valid rules collection.
     * Otherwise it returns false.
     */
    hasBenchmarkRelatedRules(): boolean {
        if (isEmpty(this.passedRulesForEachDate)) {
            return false;
        }

        // Go through the rules and determine whether it has at least one active rule.
        // And if it does, it means a What If port has benchmark related rules
        return this.passedRulesForEachDate.filter(rule =>
            rule.ruleType === CompositionConstants.RULE_TYPES.ACTIVE_SECURITY || rule.ruleType === CompositionConstants.RULE_TYPES.ACTIVE_SECTOR).length > 0;
    }

    /**
     * setting the rules which got passed.
     */
    setPassedRulesForEachDate(passedRules: Array<BaseRule>): void {
        if (isEmpty(passedRules)) {
            return;
        }

        this.passedRulesForEachDate = passedRules;
    }

    /**
     * Get Sidebar Title for what-if portfolio
     */
    getPortfolioTitleForSideBar(): string {
        if (!!this.id) {
            return '(What-if) ' + this.title;
        } else if (!isEmpty(this.fullName)) {
            return '(What-if) ' + this.fullName;
        } else {
            return super.getPortfolioTitleForSideBar();
        }
    }

    /**
     * copyFrom implementation
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Portfolio)) {
            return;
        }

        super.doCopyFrom(source);

        if (!(source instanceof WhatIfPortfolio)) {
            return;
        }

        this.compositionSetting.copyFrom(source.compositionSetting);
        this.modellingType = source.modellingType;
        this.holdingChanges = cloneDeep(source.holdingChanges);
        this.skippedRulesForEachDate = cloneDeep(source.skippedRulesForEachDate);
        this.passedRulesForEachDate = cloneDeep(source.passedRulesForEachDate);
        this.composition = cloneDeep(source.composition);
    }

    /**
     * Serialization of the child classes
     */
    protected doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const serializedObject = {
            ...super.doSerialize(isNested),
            configType: this.getConfigType(),
            compositionSetting: this.compositionSetting.serialize(isNested),
            modellingType: this.modellingType,
            compositionConfig: this.compositionConfig?.serialize(isNested)
        };

        if (CoreFavoriteUtils.isFavoriteChangeDetection(isNested)) {
            this.removeFieldsForFavoriteChangeDetection(serializedObject);
        }
        return serializedObject;
    }

    /**
     * Remove unecessary fields during serialization for favorite change detection
     */
    removeFieldsForFavoriteChangeDetection(serializedObject: any): void {
        super.removeFieldsForFavoriteChangeDetection(serializedObject);
        // must set to undefined otherwise lodash.isEqual() comparison will fail
        serializedObject.portId = undefined;
        serializedObject.cusip = undefined;
        serializedObject.isIndexResearchPortfolio = undefined;

        // if composition config is default with no changes then we should ignore it
        if (this.compositionConfig && isEmpty(this.compositionConfig.columnState?.columns) && !this.compositionConfig.colFilters) {
            serializedObject.compositionConfig = undefined;
        }

    }

    /**
     * deserialize implementation
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);
        if (data.compositionSetting) {
            this.compositionSetting.deserialize(data.compositionSetting);
        }
        if (data.compositionConfig) {
            this.compositionConfig = new CompositionConfig(undefined);
            this.compositionConfig.deserialize(data.compositionConfig);
        }
        if (data.modellingType) {
            this.setModellingType(data.modellingType);
        }
        if (this.getConfigType() !== WhatIfPortfolio.configType) {
            this.title = this.getDefaultTitle(data.title ? data.title : data.name);
        }
    }

    /**
     * Get the type of What if portfolio to be used for favorite type
     */
    protected getConfigType(): string {
        return WhatIfPortfolio.configType;
    }

    static get configType(): string {
        return 'whatIfPortfolio';
    }

    /**
     * Get the default title for what if portfolio
     */
    protected getDefaultTitle(title: string): string {
        return title;
    }

    get type(): string {
        return this.getConfigType();
    }

    /**
     * Return all the values of holdingChanges having isNavNeutral as false
     */
    clearHoldingChanges(holdingChangesToBeRetained?: HoldingChange[]): void {
        // we will have security level changes for type sector, security allocation and portfolio modelling
        this.holdingChanges = this.holdingChanges.filter(item => item instanceof PortfolioSecurityHoldingChange && !item.isNavNeutral);
        if (!isEmpty(holdingChangesToBeRetained)) {
            this.holdingChanges.push(...holdingChangesToBeRetained);
        }
    }

    /**
     * This method adds holding changes to request for benchmark whatIfPortfolio
     */
    addBenchCompositionParams(requestParams: any) {
        requestParams.benchmarkHoldingChanges = this.getSerializedHoldingChanges();
    }

    /**
     * returns serialized holding changes for what-if portfolio
     */
    getSerializedHoldingChanges(): any[] {
        return isEmpty(this.holdingChanges) ? [] : this.holdingChanges.map(holdingChange => holdingChange.serialize());
    }

    /**
     * overridden method from parent portfolio class
     * indicates to what-if and it's sub-classes
     */
    isModified(): boolean {
        return true;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.WHAT_IF_PORTFOLIO;
    }
}
