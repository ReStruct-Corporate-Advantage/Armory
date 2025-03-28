import {Setting} from '../../../core/models/setting.model';
import {PraadaExcessMethodologyModel} from './praada-excess-methodology.model';

export class PraadaCannedAttributionMethod extends Setting {

    constructor(data?: any) {
        super(data);
    }

    /**
     * Name of the praada canned attribution method
     */
    name: string;

    /**
     * List of excess methodologies which are applicable for this canned attribution method
     */
    excessMethodologies: PraadaExcessMethodologyModel[];

    /**
     * Sector Weighting
     */
    attributionWeightType: string;

    /**
     * Attribution calculation method
     */
    attributionCalculatorMethod: string;

    /**
     * Sector Level
     */
    sectorLevel: string;

    /**
     * Exposure Mode
     */
    notionalMode: string;

    /**
     * Asset class for this pre-configured method fow which it is applicable for
     */
    assetClass: string;

    /**
     * displayName
     */
    label: string;

    static createPraadaCannedAttributionDefinitions(data): PraadaCannedAttributionMethod[] {
        const praadaCannedAttributionMethods: PraadaCannedAttributionMethod[] = [];

        for (const cannedMethod of data.CannedAttributionMethods) {
            // We are not supporting custom as an attribution method. We are rather providing a way for the users to modify any given excess config
            if (cannedMethod.name !== 'CUSTOM') {
                praadaCannedAttributionMethods.push(new PraadaCannedAttributionMethod(cannedMethod));
            }
        }

        return praadaCannedAttributionMethods;
    }

    doDeserialize(data: any): void {
        this.name = data.name;
        this.label = data.displayName;
        this.attributionWeightType = data.attributionWeightType;
        this.attributionCalculatorMethod = data.attributionCalculatorMethod;
        this.sectorLevel = data.sectorLevel;
        this.notionalMode = data.notionalMode;
        this.assetClass = data.assetClass;
        this.excessMethodologies = [];
        for (const excessMethodology of data.excessMethodologies) {
            this.excessMethodologies.push(new PraadaExcessMethodologyModel(excessMethodology));
        }
    }
}
