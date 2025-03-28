import {isEmpty, isObject} from 'lodash';
import {CompositionConstants} from '@constants/composition.constants';

export class ConstraintRelationsKey {

    private static ERROR_MSG = 'Found constraintTag or constraintField as empty';

    private constraintTag: string;
    private constraintField: string;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    static createEasyObject(constraintTag: string, constraintField: string): string {
        return new ConstraintRelationsKey({constraintTag, constraintField}).toString();
    }

    /**
     * serialize
     */
    serialize(): any {
        if (isEmpty(this.constraintTag) || isEmpty(this.constraintField)) {
            throw new Error(ConstraintRelationsKey.ERROR_MSG);
        }

        return {
            constraintTag: this.constraintTag,
            constraintField: this.constraintField
        }
    }

    /**
     * deserialize
     */
    deserialize(data: any): void {
        if (isEmpty(data?.constraintTag) || isEmpty(data?.constraintField)) {
            throw new Error(ConstraintRelationsKey.ERROR_MSG);
        }

        this.constraintTag = data.constraintTag;
        this.constraintField = data.constraintField;
    }

    private toString(): string {
        if (isEmpty(this.constraintTag) || isEmpty(this.constraintField)) {
            throw new Error(ConstraintRelationsKey.ERROR_MSG);
        }

        return this.constraintTag + CompositionConstants.FAV_ID_DELIMITER + this.constraintField;
    }
}
