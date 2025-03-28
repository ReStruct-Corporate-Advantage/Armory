import {Setting} from '../../../core/models/setting.model';

export class RiskModel extends Setting {
    value: string;
    label: string;

    constructor(data?: any) {
        super(data);
    }

    /**
     * Convert risk model mappings received from backend into appropriate models
     */
    static createModelMappings(models: any[]): RiskModel[] {
        const riskModelList: RiskModel[] = [];
        for (const model of models) {
            riskModelList.push(new RiskModel(model));
        }
        return riskModelList;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.value = data.Value;
        this.label = data.Label;
    }
}
