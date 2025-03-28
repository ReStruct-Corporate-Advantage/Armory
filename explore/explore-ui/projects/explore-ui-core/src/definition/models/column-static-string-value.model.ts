/**
 * Model class to represent static value of static Column. For Eg. Currency Column has static value USD, CAD and other currencies
 **/
import {Deserialize} from '../../core/interfaces';

export class ColumnStaticStringValue implements Deserialize {
    value: string;
    desc: string;
    displayName: string;

    constructor(data?: any) {
        if (data) {
            this.deserialize(data);
        }
    }

    deserialize(data: any) {
        this.value = data.value;
        this.desc = data.desc;
        this.displayName = data.displayName;
    }
}
