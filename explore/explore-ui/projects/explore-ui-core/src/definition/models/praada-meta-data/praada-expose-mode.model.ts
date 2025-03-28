import {GenericColumnDefinition} from '../generic-column-definition.model';

export class PraadaExposeMode extends GenericColumnDefinition {
    constructor(data?: any) {
        super(data);
    }

    /**
     * Convert PraadaExposeMode definitions received from backend into appropriate models
     */
    static createPraadaExposeModeDefinitions(data): PraadaExposeMode[] {
        const praadaSettings: any = data.praadaSettings;
        const exposureModes: PraadaExposeMode[] = [];
        for (const exposureMode of praadaSettings.exposureModes) {
            exposureModes.push(new GenericColumnDefinition(exposureMode));
        }

        return exposureModes;
    }
}
