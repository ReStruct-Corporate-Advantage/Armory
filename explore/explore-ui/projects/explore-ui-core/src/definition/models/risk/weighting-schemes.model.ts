import {Setting} from '../../../core/models/setting.model';

/**
 * Weighing Schemes file variable declaration
 */
export class WeightingSchemes extends Setting {
    periodicity: string;
    defaultDecay: number;
    defaultOverlap: number;
    label: string;
    defaultPeriod: number;
    editableFields: string[];
    halfLifeLabel: string;
    isHalfLifeModifiable: boolean;
    isPeriodModifiable: boolean;
    name: string;
    toolTip: string;
    value: string;
    isCustomScheme: boolean;
    displayName: string;
    isOrgOrPortDefault: boolean;

    constructor(data?: any) {
        super(data);
    }

    /**
     * Weighing Schemes mapping to it's appropriate model
     */
    static createWeightingMapping(data: any): WeightingSchemes[][] {
        const allWeightingSchemes: WeightingSchemes[] = [];
        for (const allWeighting of data.AllWeightingSchemes) {
            allWeightingSchemes.push(new WeightingSchemes(allWeighting));
        }

        const weightingSchemes: WeightingSchemes[] = [];
        for (const weightingScheme of data.WeightingSchemes) {
            weightingSchemes.push(new WeightingSchemes(weightingScheme));
        }

        return [allWeightingSchemes, weightingSchemes];
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.periodicity = data.periodicity;
        this.defaultDecay = data.defaultDecay;
        this.defaultOverlap = data.defaultOverlap;
        this.defaultPeriod = data.defaultPeriod;
        this.editableFields = data.editableFields;
        this.label = data.displayName;
        this.halfLifeLabel = data.halfLifeLabel;
        this.isHalfLifeModifiable = data.isHalfLifeModifiable;
        this.isPeriodModifiable = data.isPeriodModifiable;
        this.name = data.name;
        this.toolTip = data.toolTip;
        this.value = data.value;
        this.isCustomScheme = data.isCustomScheme;
        this.displayName = data.displayName;
        this.isOrgOrPortDefault = data.isOrgOrPortDefault;
    }
}
