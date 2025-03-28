import {isEmpty, isObject} from 'lodash';

/**
 * The MultiManagerModel class represents the data structure for multi-manager options
 */
export class MultiManagerBreakdownModel {
    decompositionMode: string;
    decompositionType: string;
    breakdownType: string;

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Adds the multi-manager data to the request parameters if they are not empty.
     * @param reqParams The request parameters object to which the multi-manager data will be added.
     */
    addRequestParams(reqParams: any): void {
        reqParams.multiManagerData = {};

        if (this.decompositionMode !== 'none') {
            reqParams.multiManagerData.decompositionMode = this.decompositionMode;
        }
        if (this.decompositionType && this.decompositionMode !== 'none') {
            reqParams.multiManagerData.decompositionType = this.decompositionType;
        }
        if (this.breakdownType && this.decompositionMode !== 'none') {
            reqParams.multiManagerData.breakdownType = this.breakdownType;
        }
    }

    /**
     * Deserializes the provided data and assigns it to the class properties if they are not empty.
     * @param data The data to be deserialized and assigned to the class properties.
     */
    deserialize(data: any) {
        if (!isEmpty(data.decompositionMode)) {
            this.decompositionMode = data.decompositionMode;
        }
        if (!isEmpty(data.decompositionType)) {
            this.decompositionType = data.decompositionType;
        }
        if (!isEmpty(data.breakdownType)) {
            this.breakdownType = data.breakdownType;
        }
    }

    /**
     * Checks if the current multi-manager data is equal to the provided multi-manager data.
     * @param multiManagerData The multi-manager data to be compared with the current instance.
     * @returns True if the multi-manager data are equal, otherwise false.
     */
    equals(multiManagerData: MultiManagerBreakdownModel): boolean {
        if(!multiManagerData) {
            return false;
        }
        return this.decompositionMode === multiManagerData.decompositionMode &&
            this.decompositionType === multiManagerData.decompositionType &&
            this.breakdownType === multiManagerData.breakdownType;
    }

    /**
     * Serializes the class properties into an object if they are not empty.
     * @returns An object containing the serialized data.
     */
    serialize(): any {
        const data: any = {};
        if (!isEmpty(this.decompositionMode)) {
            data.decompositionMode = this.decompositionMode;
        }
        if (!isEmpty(this.decompositionType)) {
            data.decompositionType = this.decompositionType;
        }
        if (!isEmpty(this.breakdownType)) {
            data.breakdownType = this.breakdownType;
        }
        return data;
    }
}
