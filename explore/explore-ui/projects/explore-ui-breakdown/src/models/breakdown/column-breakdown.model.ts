import {cloneDeep, find, isEmpty, isNil, isObject} from 'lodash';
import {Breakdown} from './breakdown.model';
import {AbstractColumnOption, SerializeFavoriteType, WidgetInputType} from '@blk/explore-ui-core';
import {MultiManagerBreakdownModel} from '../multi-manager/multi-manager-breakdown.model';
import {BreakdownFavoriteConstants} from '../../constants/breakdown-favorite.constants';

/**
 * ColumnBreakdown
 */
export class ColumnBreakdown extends AbstractColumnOption {
    static CONFIG_TYPE = 'columnBreakdown';

    breakdown: Breakdown;
    breakdownLevel = 1;
    portfolioGroupLevel = 1;
    breakdownHideTotal: boolean;
    breakdownHideOther: boolean;
    isFullPortfolioName: boolean;
    isColumnBreakdownNormalize: boolean;
    isGroupByPortBenchActive: boolean;
    isFactorBreakdown: boolean;
    multiManagerData: MultiManagerBreakdownModel;
    breakdownHideWithNoValues = true;

    /**
     *
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return ColumnBreakdown.CONFIG_TYPE;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        //We want to keep multi manager data at same level as column breakdown option and not inside is to make the processing easier at the back-end
        if (!isEmpty(this.multiManagerData)){
            this.multiManagerData.addRequestParams(requestParams);
        }

        //If we have multi manager data but no breakdown, we should not add breakdown to request params
        if (!this.isBreakdownPopulated() || this.multiManagerData?.breakdownType === BreakdownFavoriteConstants.MM_XSR_BREAKDOWN) {
            return;
        }

        // Set Include None Buckets to true as need normalised tree. Since directly setting to true, must create copy
        const breakdownCopy = cloneDeep(this.breakdown);
        Breakdown.setIncludeNoneBucket(breakdownCopy.children, true);

        // Convert breakdown to the structure for the request params
        const breakdownRequestParam = {};
        breakdownCopy.addRequestParams(breakdownRequestParam, WidgetInputType.BREAKDOWN_TREE);


        requestParams.columnBreakdown = {
            breakdownTree: breakdownRequestParam[WidgetInputType.BREAKDOWN_TREE],
            breakdownLevel: this.breakdownLevel,
            portfolioGroupLevel: this.portfolioGroupLevel,
            breakdownHideTotal: this.breakdownHideTotal,
            breakdownHideOther: this.breakdownHideOther,
            isFullPortfolioName: this.isFullPortfolioName,
            isColumnBreakdownNormalize: this.isColumnBreakdownNormalize,
            isGroupByPortBenchActive: this.isGroupByPortBenchActive,
            isFactorBreakdown: this.isFactorBreakdown
        };
        // We would only want to add breakdownHideWithNoValues if befault behavior is changed i.e. true
        // As previous saved favorites don't have this value and adding this would impact caching
        if (!this.breakdownHideWithNoValues) {
            requestParams.columnBreakdown.breakdownHideWithNoValues = this.breakdownHideWithNoValues;
        }
    }

    addRequestParamsWithFavId(requestParams: any) {
        if (this.breakdown && this.breakdown.id) {
            requestParams.columnBreakdown = {
                id: this.breakdown.id,
                breakdownLevel: this.breakdownLevel,
                portfolioGroupLevel: this.portfolioGroupLevel,
                breakdownHideTotal: this.breakdownHideTotal,
                breakdownHideOther: this.breakdownHideOther,
                isFullPortfolioName: this.isFullPortfolioName,
                isColumnBreakdownNormalize: this.isColumnBreakdownNormalize,
                isGroupByPortBenchActive: this.isGroupByPortBenchActive,
                isFactorBreakdown: this.isFactorBreakdown
            };
        } else {
            this.addRequestParams(requestParams);
        }

        if (requestParams.columnBreakdown) {
            // PostProcess - For API this needs to be sent down as it is
            requestParams.columnBreakdown.breakdownHideWithNoValues = this.breakdownHideWithNoValues;
        }
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings?: any): void {
        this.breakdown = new Breakdown();
        this.breakdown.isConfigured = false; // Mark as not configured so the no breakdown is highlighted.
        this.breakdownLevel = 1;
        this.portfolioGroupLevel = 1;
        this.breakdownHideTotal = false;
        this.breakdownHideOther = false;
        this.isFullPortfolioName = false;
        this.isColumnBreakdownNormalize = false;
        this.isGroupByPortBenchActive = false;
        this.breakdownHideWithNoValues = true;

        // Default the isFactor to false, but then look in the settings to see if only factor is
        // supported and then switch it over to be a factor breakdown.
        this.isFactorBreakdown = false;
        if (defaultSettings && defaultSettings.columnOptionAttributes) {
            const breakdownInputs: any = find(defaultSettings.columnOptionAttributes, {key: 'columnBreakdown'});
            if (breakdownInputs && breakdownInputs.values) {
                let hasSectorBreakdown = false;
                let hasFactorBreakdown = false;
                breakdownInputs.values.forEach(function (item: any) {
                    if (item.label === 'hasSectorBreakdown') {
                        hasSectorBreakdown = item.value;
                    } else if (item.label === 'hasFactorBreakdown') {
                        hasFactorBreakdown = item.value;
                    }
                });
                if (!hasSectorBreakdown && hasFactorBreakdown) {
                    this.isFactorBreakdown = true;
                }
            }
        }
    }

    /**
     * Serialises this object
     * @return serialised object
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }

        const serializedMultiManagerData = this.multiManagerData?.serialize();
        // We would only want to add breakdownHideWithNoValues if befault behavior is changed i.e. true
        // As previous saved favorites don't have this value and adding this would impact caching
        return {
            breakdownLevel: this.breakdownLevel,
            portfolioGroupLevel: this.portfolioGroupLevel,
            isGroupByPortBenchActive: this.isGroupByPortBenchActive,
            isFullPortfolioName: this.isFullPortfolioName,
            isColumnBreakdownNormalize: this.isColumnBreakdownNormalize,
            breakdownHideTotal: this.breakdownHideTotal,
            breakdownHideOther: this.breakdownHideOther,
            breakdownObject: this.breakdown.serialize(isNested),
            isFactorBreakdown: this.isFactorBreakdown,
            breakdownHideWithNoValues: this.breakdownHideWithNoValues ? undefined : this.breakdownHideWithNoValues,
            ...(serializedMultiManagerData && !isEmpty(serializedMultiManagerData) && { multiManagerData: serializedMultiManagerData })
        };
    }

    /**
     * Deserialize the given data into this object.
     */
    deserialize(data: any): void {
        this.breakdownLevel = data.breakdownLevel;
        this.portfolioGroupLevel = data.portfolioGroupLevel;
        this.isGroupByPortBenchActive = data.isGroupByPortBenchActive;
        this.isFullPortfolioName = data.isFullPortfolioName;
        this.isColumnBreakdownNormalize = data.isColumnBreakdownNormalize;
        this.breakdownHideTotal = data.breakdownHideTotal;
        this.breakdownHideOther = data.breakdownHideOther;
        this.breakdown = new Breakdown(data.breakdownObject);
        this.isFactorBreakdown = data.isFactorBreakdown;
        this.breakdownHideWithNoValues = isNil(data.breakdownHideWithNoValues) ? true : data.breakdownHideWithNoValues;
        if (!isEmpty(data.multiManagerData)) {
            this.multiManagerData = new MultiManagerBreakdownModel(data.multiManagerData);
        }
    }

    /**
     * @see AbstractColumnOption.equals
     */
    equals(other: AbstractColumnOption): boolean {
        if (!(other instanceof ColumnBreakdown)) {
            return false;
        }

        if (this.breakdownLevel !== other.breakdownLevel) {
            return false;
        }

        if (this.portfolioGroupLevel !== other.portfolioGroupLevel) {
            return false;
        }

        if (this.isGroupByPortBenchActive !== other.isGroupByPortBenchActive) {
            return false;
        }

        if (this.isFullPortfolioName !== other.isFullPortfolioName) {
            return false;
        }

        if (this.isColumnBreakdownNormalize !== other.isColumnBreakdownNormalize) {
            return false;
        }

        if (this.breakdownHideTotal !== other.breakdownHideTotal) {
            return false;
        }

        if (this.breakdownHideOther !== other.breakdownHideOther) {
            return false;
        }

        if (this.isFactorBreakdown !== other.isFactorBreakdown) {
            return false;
        }

        if (this.breakdownHideWithNoValues !== other.breakdownHideWithNoValues) {
            return false;
        }

        if (!isNil(this.multiManagerData)) {
            return this.multiManagerData.equals(other.multiManagerData);
        }

        if (!isNil(this.breakdown)) {
            return this.breakdown.equals(other.breakdown);
        }

        return isNil(other.breakdown);
    }

    /**
     * @return true if it has valid data for the serialisation and the request parameter addition.
     * Otherwise it returns false.
     */
    isValid(): boolean {
        return this.isBreakdownPopulated() || !isNil(this.multiManagerData);
    }

    /**
     * @return false if the breakdown is empty or a placeholder breakdown.
     */
    isBreakdownPopulated(): boolean {
        return !isNil(this.breakdown) && (!this.breakdown.isEmpty() || this.breakdown.isPlaceholderBreakdown());
    }
}
