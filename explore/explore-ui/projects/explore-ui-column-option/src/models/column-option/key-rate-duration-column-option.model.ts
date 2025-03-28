import {isObject, isUndefined} from 'lodash';
import {AbstractColumnOption, KrdBucketDetails, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Key Rate Duration Column Options Model
 */
export class KeyRateDurationColumnOption extends AbstractColumnOption {
    public static CONFIG_TYPE = 'krdColumnOptions';

    krdBucketsDetails: KrdBucketDetails[];
    enableBuckets: boolean;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): KeyRateDurationColumnOption {
        if (isUndefined(optionValues.enableBuckets)) {
            return undefined;
        }
        // Create the model.
        const columnOption: KeyRateDurationColumnOption = new KeyRateDurationColumnOption();
        columnOption.enableBuckets = optionValues.enableBuckets;
        if (columnOption.enableBuckets) {
            columnOption.krdBucketsDetails = KrdBucketDetails.createKrdMapping(optionValues);
        }

        // Remove the used settings.
        delete optionValues.krdBucketDetails;
        delete optionValues.enableBuckets;

        return columnOption;
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
        return KeyRateDurationColumnOption.CONFIG_TYPE;
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        if (defaultSettings && !defaultSettings.enableBuckets) {
            this.enableBuckets = false;
        }
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['enableBuckets'] = this.enableBuckets;
        if (this.enableBuckets) {
            requestParams['krdBucketDetails'] = [];
            this.krdBucketsDetails.forEach((bucketDetails: KrdBucketDetails) => {
                if (bucketDetails.bucketName) {
                    requestParams['krdBucketDetails'].push(bucketDetails);
                }
            });
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const data: any = {};
        // The parameters are serialized only when buckets are enabled
        if (this.enableBuckets) {
            data.enableBuckets = this.enableBuckets;
            data.krdBucketDetails = this.krdBucketsDetails;
        }
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (data.enableBuckets) {
            this.enableBuckets = data.enableBuckets;
            this.krdBucketsDetails = KrdBucketDetails.createKrdMapping(data);
        }
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: KeyRateDurationColumnOption): boolean {
        if (!(otherColOption instanceof  KeyRateDurationColumnOption)) {
            return false;
        }
        if (this.enableBuckets !== otherColOption.enableBuckets) {
            return false;
        }
        if (this.krdBucketsDetails?.length !== otherColOption.krdBucketsDetails?.length) {
            return false;
        }
        return (this.krdBucketsDetails || []).every((bucket: KrdBucketDetails, i) => bucket.equals(otherColOption.krdBucketsDetails[i]));
    }

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isUndefined(this.enableBuckets);
    }
}
