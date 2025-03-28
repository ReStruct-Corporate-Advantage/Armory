import {Setting} from '@blk/explore-ui-core';

export class SplitPositionType extends Setting {

    /**
     * Split position variable
     */
    name: string;
    description: string;
    defaultSelected: boolean;
    splitSubTypeDesc: string;

    constructor(data?: any) {
        super(data);
    }

    /**
     * Passing SplitPosition to appropriate model
     */
    static createSplitPositionTypes(data: any): Array<SplitPositionType> {
        const splitPositionType: Array<SplitPositionType> = [];
        for (const splitPosition of data.splitPositionTypes) {
            splitPositionType.push(new SplitPositionType(splitPosition));
        }

        return splitPositionType;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.name = data.name;
        this.description = data.description;
        this.defaultSelected = data.defaultSelected;
        this.splitSubTypeDesc = data.splitSubTypeDesc;
    }
}
