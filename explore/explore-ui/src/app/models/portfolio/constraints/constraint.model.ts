import {isEqual, isObject, mapValues, isNil, isEmpty, isArray} from 'lodash';
import {
    AbstractConfig,
    ColumnConfig,
    ColumnFormat,
    ConfigTypeFactory,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {
    CUSTOM_FILTER,
    CUSTOM_SECURITY_LIST
} from '@optimization-settings/constraints-settings/constants/constraint.constants';

/**
 * Constraint Model Class for Optimization Constraint
 */
export class Constraint extends AbstractConfig {
    constraintTag: string;
    constraintType: string;
    title: string;
    group: string;
    restrictedConstraints: Array<string>;
    constraintOptions: any;
    optionValues: any = {};
    enabled: boolean;
    isFrozen: boolean;
    isRelaxable: boolean;
    relaxationValue: number;
    dataType: string;
    columnFormat: ColumnFormat;
    positionType: string;
    columnConfig: ColumnConfig;

    /**
     * Optimization models mapping to appropriate models
     */
    static createOptimizationConstraintMapping(data: any): Array<Constraint> {
        const optimizationConstraint: Array<Constraint> = [];
        for (const constraint of data.optimizationConstraints) {
            optimizationConstraint.push(new Constraint(constraint));
        }
        return optimizationConstraint;
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
     * Return false if the passed in Constraint is not equal
     */
    equals(otherConstraint: Constraint): boolean {
        if (this.enabled !== otherConstraint.enabled) {
            return false;
        }
        if (this.relaxationValue !== otherConstraint.relaxationValue) {
            return false;
        }
        if (this.constraintTag !== otherConstraint.constraintTag) {
            return false;
        }
        if (this.constraintType !== otherConstraint.constraintType) {
            return false;
        }
        if (this.title !== otherConstraint.title) {
            return false;
        }
        if (this.group !== otherConstraint.group) {
            return false;
        }
        if (this.isFrozen !== otherConstraint.isFrozen) {
            return false;
        }
        if (this.isRelaxable !== otherConstraint.isRelaxable) {
            return false;
        }
        if (
            (!this.restrictedConstraints && otherConstraint.restrictedConstraints) ||
            (this.restrictedConstraints && !otherConstraint.restrictedConstraints)
        ) {
            return false;
        }
        if (this.restrictedConstraints && otherConstraint.restrictedConstraints) {
            if (this.restrictedConstraints.length !== otherConstraint.restrictedConstraints.length) {
                return false;
            }
            for (let i = 0; i < this.restrictedConstraints.length; i++) {
                if (this.restrictedConstraints[i] !== otherConstraint.restrictedConstraints[i]) {
                    return false;
                }
            }
        }

        if (this.constraintOptions !== otherConstraint.constraintOptions) {
            return false;
        }

        if (this.dataType !== otherConstraint.dataType) {
            return false;
        }

        if (!isEqual(this.columnFormat, otherConstraint.columnFormat)) {
            return false;
        }

        if (!isEqual(this.positionType, otherConstraint.positionType)) {
            return false;
        }

        if (!isNil(this.columnConfig) && !this.columnConfig.equals(otherConstraint.columnConfig)) {
            return false;
        }

        return isEqual(this.optionValues, otherConstraint.optionValues);
    }

    /**
     * Return data to be saved for this Constraint
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const dataToSave: any = {
            enabled: this.enabled,
            relaxationValue: this.relaxationValue,
            constraintTag: this.constraintTag,
            constraintType: this.constraintType,
            isFrozen: this.isFrozen,
            dataType: this.dataType,
            columnFormat: this.columnFormat,
            positionType: this.positionType,
            isRelaxable: this.isRelaxable,
            group: this.group,
            columnConfig: this.columnConfig?.serialize(isNested)
        };

        // Add the option values to the return data.
        // NOTE:  the reason we have to process this separately is that we need to call serialize on nested configuration objects.
        if (this.optionValues) {
            dataToSave.optionValues = {};
            Object.entries(this.optionValues).forEach(([key, value]: [string, AbstractConfig]) => {
                // option values never had a proper model set up, so it's a combination of key-value pairs and nested configs
                if (value instanceof AbstractConfig) {
                    value = value.serialize(isNested);
                }
                if (value instanceof Map) {
                    value = JSON.stringify(Array.from(value.entries())) as any;
                }
                dataToSave.optionValues[key] = value;
            });
        }

        return dataToSave;
    }

    /**
     * Set attributes from the passed in data on this Constraint
     */
    deserialize(data: any): void {
        this.enabled = data.enabled;
        this.relaxationValue = data.relaxationValue;
        this.constraintTag = data.constraintTag;
        this.constraintType = data.constraintType;
        this.isFrozen = data.isFrozen;
        this.group = data.group;
        this.isRelaxable = data.isRelaxable;
        this.title = data.title;
        this.dataType = data.dataType;
        this.columnFormat = data.columnFormat;
        this.positionType = data.positionType;

        // Deserialize the option values.
        // NOTE:  the reason we have to process this separately is that we need to call deserialize on nested configuration objects.
        if (data.optionValues) {
            this.optionValues = mapValues(data.optionValues, (value: any, key: string) =>
                ConfigTypeFactory.createConfig(value, key, false)
            );
        } else {
            this.optionValues = {};
        }
        // convert the selectedSecurities from plane object to a map
        if (isArray(this?.optionValues?.selectedSecurities)) {
            this.optionValues.selectedSecurities = new Map(this.optionValues.selectedSecurities);
        }

        if (!isNil(data.columnConfig)) {
            this.columnConfig = new ColumnConfig();
            this.columnConfig.deserialize(data.columnConfig);
        }
    }

    /**
     * Returns the type of security list to which security constraint is applied
     */
    getSecurityConstraintAssociatedSecurityList(): string|void {
        if (!isNil(this.optionValues?.securityList)) {
            return this.optionValues.securityList;
        } else if (!isEmpty(this.optionValues?.selectedSecurities)) {
            return CUSTOM_SECURITY_LIST;
        } else if (!isNil(this.optionValues?.securityConstraintFilter)) {
            return CUSTOM_FILTER;
        }
    }
}
