import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * FactorDataRiskMatrixSettings model
 */
export class FactorDataRiskMatrixSettings extends AbstractConfig implements WidgetInput {

    static readonly FACTOR_DATA_RISK_MATRIX_SETTINGS = 'factorDataRiskMatrixSettings';

    isTriangularMatrix: boolean;
    comparisonDate: string;
    showChangeInUpperTriangle: boolean;

    /**
     * Constructor to create an instance of TimeSeriesSettings
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return true if the passed in timeSeriesSettings is equal to this timeSeriesSettings
     */
    equals(data: AbstractConfig): boolean {
        if (!(data instanceof FactorDataRiskMatrixSettings)) {
            return false;
        }
        if (this.showChangeInUpperTriangle !== data.showChangeInUpperTriangle) {
            return false;
        }
        if (this.isTriangularMatrix !== data.isTriangularMatrix) {
            return false;
        }
        return this.comparisonDate === data.comparisonDate;
    }

    /**
     * @return true as it's data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.isTriangularMatrix = data.isTriangularMatrix;
        this.showChangeInUpperTriangle = data.showChangeInUpperTriangle;
        this.comparisonDate = data.comparisonDate;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize Object properties into javascript object to be stored as json in favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            isTriangularMatrix: this.isTriangularMatrix,
            showChangeInUpperTriangle: this.showChangeInUpperTriangle,
            comparisonDate: this.comparisonDate,
        };
    }

    /**
     * Add parameters to the request
     */
    addRequestParams(optionValues: any): void {
        const params: any = {};
        params.isTriangularMatrix = this.isTriangularMatrix;
        params.showChangeInUpperTriangle = this.showChangeInUpperTriangle;
        if (this.comparisonDate) {
            params.comparisonDate = this.comparisonDate;
        }
        optionValues[FactorDataRiskMatrixSettings.FACTOR_DATA_RISK_MATRIX_SETTINGS] = params;
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return FactorDataRiskMatrixSettings.FACTOR_DATA_RISK_MATRIX_SETTINGS;
    }
}
