import {GenericColumnDefinition} from '../generic-column-definition.model';

export class PraadaSectorWeighting extends GenericColumnDefinition {

    /**
     * List of supported attributionCalculatorMethods for this sector weighting type
     */
    attributionCalculatorMethods: string[];

    constructor(data?: any) {
        super(data);
    }

    /**
     * Returning Praada sector weighing to get initialized
     */
    static createPraadaSectorWeighingDefinitions(data): PraadaSectorWeighting[] {
        const praadaSettings: any = data.praadaSettings;
        const sectorWeightings: PraadaSectorWeighting[] = [];
        for (const sectorWeighting of praadaSettings.sectorWeightings) {
            sectorWeightings.push(new PraadaSectorWeighting(sectorWeighting));
        }

        return sectorWeightings;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        super.doDeserialize(data);
        this.attributionCalculatorMethods = data.attributionCalculatorMethods;
    }


}
