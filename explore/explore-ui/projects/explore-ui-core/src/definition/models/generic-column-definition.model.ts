import {Setting} from '../../core/models/setting.model';

export class GenericColumnDefinition extends Setting {
    value: string;
    label: string;

    constructor(data?: any) {
        super(data);
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.value = data.value;
        this.label = data.displayName;
    }
}
