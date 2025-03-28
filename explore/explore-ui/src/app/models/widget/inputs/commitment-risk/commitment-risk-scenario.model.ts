import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {AppUtils} from '@utils/app.utils';

export class CommitmentRiskScenario extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    private readonly SCENARIO_REQUEST_PARAM: string = 'scenario';

    // name of the stress scenario to apply to the commitment risk widget
    scenario: string;

    constructor(data?: any) {
        super();
        this.deserialize(data);
    }

    addRequestParams(requestParams: any): void {
        // undefined means server will default to only showing Base scenario
        if (this.scenario) {
            requestParams[this.SCENARIO_REQUEST_PARAM] = this.scenario;
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.scenario;
    }


    deserialize(_data: any) {
        // must add default in JSON widget config for setting to be initialized, default is {} so scenario will be undefined
        if (AppUtils.isObject(_data)) {
            this.scenario = _data.scenario;
        } else {
            this.scenario = _data;
        }
    }

    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof CommitmentRiskScenario)) {
            return false;
        }
        return this.scenario === widgetInput.scenario;
    }

    getConfigType(): string {
        return WidgetInputType.COMMITMENT_RISK_SCENARIO;
    }

    static get configType(): string {
        return WidgetInputType.COMMITMENT_RISK_SCENARIO;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * geting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        return {
            scenario: this.scenario
        };
    }
}
