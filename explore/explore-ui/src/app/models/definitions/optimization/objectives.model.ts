import {Setting} from '@blk/explore-ui-core';

export class Objectives extends Setting {

    objectiveDisplayValue: string;
    objectiveKey: string;
    restrictedObjectives: Array<string>;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super(data);
    }

    /**
     * Optimization models mapping to appropriate models
     */
    static createOptimizationObjectiveMapping(data: any): Array<Objectives> {
        const optimizationObjective: Array<Objectives> = [];
        for (const objective of data.optimizationObjectives) {
            optimizationObjective.push(new Objectives(objective));
        }

        return optimizationObjective;
    }

    /**
     * Set attributes from data into this object.
     */
    doDeserialize(data: any): void {
        this.objectiveDisplayValue = data.objectiveDisplayValue;
        this.objectiveKey = data.objectiveKey;
        this.restrictedObjectives = data.restrictedObjectives;
    }
}
