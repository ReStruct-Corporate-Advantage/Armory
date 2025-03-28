import {GenericColumnDefinition} from '../generic-column-definition.model';
import {CoreCommonConstants} from '../../../core/constants';

export class PraadaFactor extends GenericColumnDefinition {

    constructor(data?: any) {
        super(data);
    }

    /**
     * List of asset classes for which this factor is applicable for
     */
    assetClassList: string[];

    /**
     * Factor Group to which this factor belongs like FX Contribution has FX as the group
     */
    factorGroup: string;

    /**
     * List of factors forming the factor grouping
     */
    factorGroupList: string[];

    /**
     * Column tag for the active version of the column representing this factor
     */
    activeColumnTag: string;

    static createPraadaFactorDefinitions(data): PraadaFactor[][] {
        const praadaSettings: any = data.praadaSettings;
        const accountingFactors: PraadaFactor[] = [];
        for (const accountingFactor of praadaSettings.accountingFactors) {
            accountingFactor.factorGroupList = ['Holdings based factors', 'Accounting'];
            accountingFactor.factorGroup = CoreCommonConstants.EMPTY_STRING;
            accountingFactors.push(new PraadaFactor(accountingFactor));
        }

        const attributionFactors: PraadaFactor[] = [];
        for (const attributionFactor of praadaSettings.attributionFactors) {
            attributionFactor.factorGroupList = ['Holdings based factors', 'Parametric'];
            attributionFactor.factorGroup = CoreCommonConstants.EMPTY_STRING;
            attributionFactors.push(new PraadaFactor(attributionFactor));
        }

        const tradeBasedFactors: PraadaFactor[] = [];
        for (const tradeBasedFactor of praadaSettings.tradeBasedFactors) {
            tradeBasedFactor.factorGroupList = ['Transaction based factors', 'Trade based'];
            tradeBasedFactor.factorGroup = CoreCommonConstants.EMPTY_STRING;
            tradeBasedFactors.push(new PraadaFactor(tradeBasedFactor));
        }

        return[accountingFactors, attributionFactors, tradeBasedFactors];
    }

    doDeserialize(data: any): void {
        super.doDeserialize(data);
        this.assetClassList = data.assetClassList;
        this.factorGroup = data.factorGroup;
        this.factorGroupList = data.factorGroupList;
        this.activeColumnTag = data.activeColumnTag;
    }
}
