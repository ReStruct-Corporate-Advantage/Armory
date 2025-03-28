import {isEmpty, isObject} from 'lodash';

export class DependentConstraintsMetaData {

    private static ERROR_MSG = 'Found dependentConstraintTags and notification as empty.';

    private dependentConstraintTags: string[];
    private notification: string;

    /**
     * This method creates the object for this class.
     */
    static createDependentConstraintsMetaData(dependentConstraintTags: string[], notification: string): DependentConstraintsMetaData {
        return new DependentConstraintsMetaData({
            dependentConstraintTags,
            notification
        });
    }

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * serialize
     */
    serialize(): any {
        if (isEmpty(this.dependentConstraintTags) && isEmpty(this.notification)) {
            throw new Error(DependentConstraintsMetaData.ERROR_MSG);
        }

        return {
            dependentConstraintTags: this.dependentConstraintTags,
            notification: this.notification
        };
    }

    /**
     * deserialize
     */
    deserialize(data: any): void {
        if (isEmpty(data?.dependentConstraintTags) && isEmpty(data?.notification)) {
            throw new Error(DependentConstraintsMetaData.ERROR_MSG);
        }

        this.dependentConstraintTags = isEmpty(data?.dependentConstraintTags) ? [] : [...data.dependentConstraintTags];
        this.notification = data.notification;
    }
}
