import {Deserialize} from '../interfaces';

/**
 * Setting class is not serializable so implementing with deserializable interface
 */
export abstract class Setting implements Deserialize {

    constructor(data?: any) {
        if (data) {
            this.deserialize(data);
        }
    }

    deserialize(data?: any): void {
        if (!data) {
            return null;
        }
        this.doDeserialize(data);
    }

    protected abstract doDeserialize(data: any): void;
}
