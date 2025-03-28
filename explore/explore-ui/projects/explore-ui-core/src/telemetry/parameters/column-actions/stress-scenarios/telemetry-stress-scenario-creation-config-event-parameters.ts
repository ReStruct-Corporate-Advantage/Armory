import {TelemetryFactorParameters} from '../../widget-actions/factor-data-widget';

/**
 * TelemetryStressScenarioCreationConfigEventParameters captures information related to stress scenario creation
 */
export class TelemetryStressScenarioCreationConfigEventParameters {
    scenarioType: string;
    dxsShockUnit: string;
    impliedShockUnit: string;
    restrictImpliedShock: string;
    noiseDampening: string;
    startDate: string;
    endDate: string;
    holdingPeriodOverride: number;
    createNewSpecifiedScenario: boolean;
    shockCorrelationsDateEnabled: boolean;
    viewedAsSpecifiedShock: boolean;
    factorColumnsList: TelemetryFactorParameters[];

    constructor() {}
}
