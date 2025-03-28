import {GenericColumnDefinition} from '../generic-column-definition.model';

export class PraadaCustomPivotPoint extends GenericColumnDefinition {

    constructor(data?: any) {
        super(data);
    }

    /**
     * Returning Praada custom pivot point to get initialized
     */
    static createPraadaCustomPivotPointDefinitions(data: any): PraadaCustomPivotPoint[] {
        const praadaSettings: any = data.praadaSettings;
        const customPivotPoint: PraadaCustomPivotPoint[] = [];
        for (const pivotPoint of praadaSettings.customPivotPoints) {
            customPivotPoint.push(new PraadaCustomPivotPoint(pivotPoint));
        }

        return customPivotPoint;
    }
}
