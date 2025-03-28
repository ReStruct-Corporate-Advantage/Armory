import {Setting} from '../../core/models/setting.model';

export class KrdBucketDetails extends Setting {

    /**
     * Krd Bucket arguments
     */
    bucketName: string;
    colTag: string;
    name: string;
    value: string;

    constructor(data?: any) {
        super(data);
    }

    /**
     * Passing values of KrdBucket into its appropriate model
     */
    static createKrdMapping(data: any): KrdBucketDetails[] {
        const krdBucketDetail: KrdBucketDetails[] = [];
        for (const krdDetail of data.krdBucketDetails) {
            krdBucketDetail.push(new KrdBucketDetails(krdDetail));
        }
        return krdBucketDetail;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.value = data.value;
        this.bucketName = data.bucketName;
        this.colTag = data.colTag;
        this.name = data.name;
    }

    equals(other: KrdBucketDetails): boolean {
        return this.bucketName === other.bucketName &&
            this.colTag === other.colTag &&
            this.name === other.name &&
            this.value === other.value;
    }
}
