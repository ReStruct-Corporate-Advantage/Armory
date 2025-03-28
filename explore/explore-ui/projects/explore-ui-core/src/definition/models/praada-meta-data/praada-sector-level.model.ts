import {GenericColumnDefinition} from '../generic-column-definition.model';

export class PraadaSectorLevel extends GenericColumnDefinition {

    constructor(data?: any) {
        super(data);
    }

    /**
     * Convert PraadaSectorLevel definitions received from backend into appropriate models
     */
    static createPraadaSectorLevelDefinitions(data): PraadaSectorLevel[] {
        const praadaSettings: any = data.praadaSettings;
        const sectorLevels: PraadaSectorLevel[] = [];
        for (const sectorLevel of praadaSettings.sectorLevels) {
            sectorLevels.push(new GenericColumnDefinition(sectorLevel));
        }

        return sectorLevels;
    }
}
