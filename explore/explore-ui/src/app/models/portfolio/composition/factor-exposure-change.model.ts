import {Serializable} from '@blk/explore-ui-core';
import {isNumber, isObject} from 'lodash';


export class FactorExposureChange implements Serializable {

    exposureValue = 0;
    factorTitle: string;
    newExposureValue = 0;

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }


    serialize(): any {
        return {
            exposureValue: this.exposureValue,
            newExposureValue: this.newExposureValue,
            factorTitle: this.factorTitle,
        };
    }

    deserialize(data: any) {
        if (isNumber(data.exposureValue)) {
            this.exposureValue = data.exposureValue;
        }
        if (isNumber(data.newExposureValue)) {
            this.newExposureValue = data.newExposureValue;
        }
        if (data.factorTitle) {
            this.factorTitle = data.factorTitle;
        }
    }

    equals(obj: any): boolean {
        if (!(obj instanceof FactorExposureChange)) {
            return false;
        }

        if (obj.exposureValue !== this.exposureValue) {
            return false;
        }

        return obj.newExposureValue === this.newExposureValue;


    }

}

