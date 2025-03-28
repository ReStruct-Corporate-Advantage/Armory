import {Setting} from '../../../core/models/setting.model';

export class PraadaExcessMethodologyModel extends Setting {
    /**
     * Unique name of the Praada Excess methodology
     */
    name: string;

    /**
     * List of attribution and accounting factors
     */
    factors: string[];

    /**
     * displayNAme
     */
    label: string;

    constructor(data?: any) {
        super(data);
    }

    doDeserialize(data: any): void {
        this.name = data.name;
        this.factors = data.factors;
        this.label = data.displayName;
    }
}
