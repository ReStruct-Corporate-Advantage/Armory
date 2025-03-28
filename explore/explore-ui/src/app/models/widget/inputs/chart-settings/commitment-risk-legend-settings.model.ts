import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject, isUndefined} from 'lodash';
import {PercentileRange} from '@enums/commitment-risk-percentiles.enum';

/**
 * Settings for Commitment Risk Chart Legend
 */
export class CommitmentRiskLegendSettings extends AbstractConfig implements WidgetInput {

    showBaseScenario: boolean;
    showStressScenario: boolean;
    percentileRange: PercentileRange;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any): void {
        if (isUndefined(data)) {
            return;
        }
        this.showBaseScenario = data.showBaseScenario;
        this.showStressScenario = data.showStressScenario;
        this.percentileRange = data.percentileRange;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            showBaseScenario: this.showBaseScenario,
            showStressScenario: this.showStressScenario,
            percentileRange: this.percentileRange
        };
    }

    equals(data: AbstractConfig): boolean {
        if (!(data instanceof CommitmentRiskLegendSettings)) {
            return false;
        }
        return this.showBaseScenario === data.showBaseScenario &&
            this.showStressScenario === data.showStressScenario &&
            this.percentileRange === data.percentileRange;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }
}
