import {Setting} from '../../../core/models/setting.model';

export class RiskParameter extends Setting {

    /**
     * Risk Horizon variables
     */
    value: string;
    text: string;

    constructor(data?: any) {
        super(data);
    }

    /**
     * Risk Horizons model mapping to it's appropriate mapping
     */
    static createRiskMapping(data: any): RiskParameter[][] {
        const excludeFactorBlock: RiskParameter[] = [];
        for (const excludeFactor of data.excludeFactorBlocks) {
            excludeFactorBlock.push(new RiskParameter(excludeFactor));
        }

        const riskHorizon: RiskParameter[] = [];
        for (const horizon of data.riskHorizons) {
            riskHorizon.push(new RiskParameter(horizon));
        }

        return [excludeFactorBlock, riskHorizon];
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.value = data.value;
        this.text = data.text;
    }
}
