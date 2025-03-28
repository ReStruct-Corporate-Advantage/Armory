import {isEmpty, isObject} from 'lodash';
import {CustomCalculationConstants} from '../../constants/custom-calculation.constants';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * This class acts model for CustomCalculationMeasureNode column option i.e. value for Measures will used from total,security, parent, immediate parent, first level.
 */
export class CustomCalculationMeasureNodeColumnOption extends AbstractColumnOption {
    static CONFIG_TYPE = 'customCalculationNodeType';

    /**
     * Represent pick value from which node level i.e. SECURITY,PARENT,FIRST LEVEL, IMMEDIATE PARENT
     */
    nodeTypeValue: string;

    /**
     * Get Display name based on selected NodeType
     */
    static getDisplayNodeName(measureNodeName: string): string {
        switch (measureNodeName) {
            case CustomCalculationConstants.SECURITY:
                return 'Security';
            case CustomCalculationConstants.PORTFOLIO:
                return 'Portfolio';
            case CustomCalculationConstants.PARENT:
                return 'Immediate Parent';
            case CustomCalculationConstants.FIRST_LEVEL:
                return 'First Level';
            case CustomCalculationConstants.TOTAL:
                return 'Total';
            default:
                return 'Security';
        }
    }

    /**
     * Constructor
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
        return CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE;
    }

    /**
     * Add required Params to option values.
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams['customCalculationNode'] = {
            nodeType: this.nodeTypeValue
        };
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        if (defaultSettings?.isPgsCustomCalculation) {
            this.nodeTypeValue = CustomCalculationConstants.PORTFOLIO;
        } else {
            this.nodeTypeValue = CustomCalculationConstants.SECURITY;
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        // we don't want to save model if no node type defined.
        return !this.nodeTypeValue ? undefined : {measureNode: this.nodeTypeValue};
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        // Grab out all the simple parameters.
        this.nodeTypeValue = data.measureNode;
    }

    /**
     * Equals method implementation to compare with other column option
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CustomCalculationMeasureNodeColumnOption)) {
            return false;
        }

        return this.nodeTypeValue === otherColOption.nodeTypeValue;
    }

    isValid(): boolean {
        return !isEmpty(this.nodeTypeValue);
    }
}
