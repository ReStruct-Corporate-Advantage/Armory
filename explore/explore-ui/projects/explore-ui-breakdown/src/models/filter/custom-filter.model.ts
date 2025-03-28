import {isEmpty, isNil, isObject, isUndefined} from 'lodash';
import {
    AbstractConfig,
    ConfigTypeFactory,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput
} from '@blk/explore-ui-core';
import {ColumnSectorRule} from '../sector/column-sector/column-sector-rule.model';
import {LinkedFavoriteSector} from '../sector/linked-favorite-sector.model';
import {Breakdown} from '../breakdown/breakdown.model';
import {CustomSector} from '../sector/custom-sector/custom-sector.model';

/**
 * Class for Filter rule
 */
export class CustomFilter extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    static readonly CONFIG_TYPE = 'customFilter';

    customSector: CustomSector;
    title: string;

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
     * Gets the config type for Filter
     */
    get configType(): string {
        return CustomFilter.CONFIG_TYPE;
    }

    getConfigType() {
        return CustomFilter.CONFIG_TYPE;
    }

    /**
     * add compositionFilter as param if filter is not empty
     */
    addRequestParams(requestParams: any, paramName?: string) {
        // Only bother adding if the filter has something in it.
        if (!this.isFilterEmpty()) {
            requestParams[paramName] = this.returnSerializedFilter();
        }
    }

    /**
     * full serialize filter
     */
    returnSerializedFilter(): string {
        return JSON.stringify(this.serialize(SerializeFavoriteType.SERIALIZE_FULL_FAVORITE));
    }

    /**
     * Return true if filter is empty otherwise return false
     */
    isFilterEmpty(): boolean {
        // If customSector is undefined or rule is undefined then filter is empty
        if (!this.customSector && isEmpty(this.customSector)) {
            return true;
        }

        if (!this.customSector.rule && isEmpty(this.customSector.rule)) {
            return true;
        }

        // If the rule is a column rule then we want to make sure that a column is specified.
        if (this.customSector.rule instanceof ColumnSectorRule) {
            const columnRule: ColumnSectorRule = this.customSector.rule;
            return isUndefined(columnRule.columnTag) || columnRule.columnTag === '';
        }

        // For all other scenarios it is not empty.
        return false;
    }

    /**
     * Return true if two objects are equal.
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof CustomFilter)) {
            return false;
        }
        if (!isNil(this.customSector) && !isNil(widgetInput.customSector)) {
            return this.customSector.equals(widgetInput.customSector);
        }
        return isNil(this.customSector) && isNil(widgetInput.customSector);
    }

    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * deserialize method
     */
    deserialize(data: any): void {
        if (data instanceof CustomSector) {
            // This seems to happen when a user has saved a favorite custom sector and then used it as a filter on a widget.
            this.customSector = data;
        }else if(data.customSector instanceof CustomSector){
            this.customSector = data.customSector;
        } else if (data.breakdown) {
            // Since we serialise the filter as a breakdown (sort of) we now need to create a breakdown
            // and then grab the first custom sector off it.
            const breakdown: Breakdown = new Breakdown(data);
            if (breakdown && breakdown.children && breakdown.children[0] instanceof LinkedFavoriteSector) {
                this.customSector = (breakdown.children[0] as LinkedFavoriteSector).sector as CustomSector;
            }
        } else if (data.filter) {
            const config: AbstractConfig = ConfigTypeFactory.createConfig(data.filter, CustomFilter.CONFIG_TYPE, false);
            if (config instanceof CustomSector) {
                this.customSector = config;
            } else if (config instanceof Breakdown) {
                const breakdown: Breakdown = config;
                if (!breakdown.isEmpty()) {
                    this.customSector = (breakdown.children[0] as LinkedFavoriteSector).sector as CustomSector;
                }
            } else if (config instanceof CustomFilter) {
                this.customSector = config.customSector;
            }
        }

        if (!isEmpty(data['title'])) {
            this.title = data['title'];
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * serialize method
     */
    serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractConfig) => boolean): any {
        const favTitle = !isEmpty(this.title) ? {title: this.title} : undefined;
        if (this.isFilterEmpty()) {
            return favTitle;
        }

        // Storing in this format as currently backend expect breakdown tree object.
        const data: any = {
            breakdown: {
                subSectors: []
            },
            ...favTitle
        };

        data.breakdown.subSectors.push(this.customSector.serialize(isNested, shouldSaveLinkedFav));
        return data;
    }
}
