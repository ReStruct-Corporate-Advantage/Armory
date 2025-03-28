import {DateScenario, Serializable, WidgetInput} from '@blk/explore-ui-core';
import {ScenarioTypeEnum} from '../enums/scenario-type.enum';
import {isObject} from 'lodash';
import {ScenarioCategoryEnum} from '../enums/scenario-category.enum';
import {Subject} from 'rxjs';
import {ImpliedShockScenario} from './scenario-types/implied-shock-scenario.model';
import {SpecifiedShockScenario} from './scenario-types/specified-shock-scenario.model';
import {ScenarioUtils} from '../utils/scenario.utils';
import {ScenarioConstants} from '../constants/scenario.constant';

export class StressScenario implements Serializable, WidgetInput {

    static readonly STRESS_SCENARIO_SETTINGS = 'stressScenarioSettings';

    scenName: string;
    scenType: ScenarioTypeEnum;
    scenDesc: string;
    scenVis: string;
    scenCategory: ScenarioCategoryEnum = ScenarioCategoryEnum.MY_SCENARIOS;
    scenCode: string;

    impliedShockScenario: ImpliedShockScenario;
    specifiedShockScenario: SpecifiedShockScenario;
    dateScenario: DateScenario;

    /**
     * For View as Specified scenario workflow
     */
    convertToSpecifiedShock = false;
    convertFromScenario: ScenarioTypeEnum;

    scenarioUpdated$ = new Subject<void>();

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        } else {
            // default scenario created
            this.scenType = ScenarioTypeEnum.IMPLIED_SHOCK;
            this.setScenarioSettings();
        }
    }

    copy(data: StressScenario): void {
        this.scenName = data.scenName;
        this.scenType = data.scenType;
        this.scenDesc = data.scenDesc;
        this.scenVis = data.scenVis;
        this.scenCategory = data.scenCategory;
        this.scenCode = data.scenCode;
        this.impliedShockScenario = data.impliedShockScenario;
        this.specifiedShockScenario = data.specifiedShockScenario;
        this.dateScenario = data.dateScenario;
        this.convertToSpecifiedShock = data.convertToSpecifiedShock;
        this.convertFromScenario = data.convertFromScenario;
    }

    resetParams(): void {
        this.setScenarioSettings();
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize() {
        throw new Error('Method not implemented.');
    }

    deserialize(data: any) {
        this.scenName = data.scenName;
        this.scenType = data.scenType;
        this.scenDesc = data.scenDesc;
        this.scenVis = data.scenVis;
        if (data.scenCategory) {
            this.scenCategory = data.scenCategory;
        }

        this.setScenarioSettings(data);
    }

    /**
     * For Save scenario request
     */
    addRequestParamsForSaveScenario(requestParams: any): void {
        if (this.scenName) {
            requestParams.scenName = this.scenName;
        }
        if (this.scenType) {
            requestParams.scenType = this.scenType;
        }
        if (this.scenDesc) {
            requestParams.scenDesc = this.scenDesc;
        }
        if (this.scenVis) {
            requestParams.scenVis = this.scenVis;
        }

        if (this.scenType === ScenarioTypeEnum.IMPLIED_SHOCK) {
            this.impliedShockScenario.addRequestParams(requestParams);
        } else if (this.scenType === ScenarioTypeEnum.SPECIFIED_SHOCK) {
            this.specifiedShockScenario.addRequestParams(requestParams);
        }
    }

    private setScenarioSettings(data?: any): void {
        this.impliedShockScenario = undefined;
        this.specifiedShockScenario = undefined;
        this.dateScenario = undefined;
        if (this.scenType === ScenarioTypeEnum.IMPLIED_SHOCK) {
            this.impliedShockScenario = new ImpliedShockScenario(data);
        } else if (this.scenType === ScenarioTypeEnum.SPECIFIED_SHOCK) {
            this.specifiedShockScenario = new SpecifiedShockScenario(data);
        } else if (this.scenType === ScenarioTypeEnum.DATE_RANGE) {
            this.dateScenario = new DateScenario();
            this.dateScenario.setDateRangeStressScenarioParams(data);
            if (!this.dateScenario.dxsShockUnit) {
                this.dateScenario.dxsShockUnit = ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;
            }
        }
        this.convertToSpecifiedShock = false;
        this.convertFromScenario = undefined;
        this.scenCode = undefined;
    }

    equals(_widgetInput: WidgetInput): boolean {
        throw new Error('Method not implemented.');
    }

    isDataStoreInput(): boolean {
        return true;
    }

    removeFieldsForFavoriteChangeDetection(_serializedObject: any): void {
        // Intentionally empty
    }

    getConfigType(): string {
        return StressScenario.STRESS_SCENARIO_SETTINGS;
    }

    /**
     * For Specified Scenario request
     */
    addRequestParamsForSpecifiedRequest(shockCol: any): void {
        let scenarioParams: any;
        if (!this.convertToSpecifiedShock) {
            // add saved specified scenario
            const namedScenario = ScenarioUtils.createNamedScenarioFromStressScenario(this);
            scenarioParams = namedScenario.serialize();
        } else if (this.convertFromScenario === ScenarioTypeEnum.IMPLIED_SHOCK) {
            // add unsaved implied scenario
            scenarioParams = this.impliedShockScenario.getParamsForConversionToSpecified();
            this.specifiedShockScenario.dxsShockUnit = this.impliedShockScenario.getDxsShockUnitValue();
        } else if (this.convertFromScenario === ScenarioTypeEnum.DATE_RANGE) {
            // add unsaved date range scenario
            scenarioParams = this.dateScenario.serialize();
            this.specifiedShockScenario.dxsShockUnit = this.dateScenario.dxsShockUnit ?? ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;
        } else {
            scenarioParams = {};
        }
        shockCol.optionValues = {};
        shockCol.optionValues.scenarioList = [scenarioParams];
    }

    isCreateNewSpecifiedScenarioFlow(): boolean {
        return !this.convertToSpecifiedShock && !this.specifiedShockScenario.isSavedSpecifiedScenario;
    }

    isTeamScenario(): boolean {
        return this.scenCategory === ScenarioCategoryEnum.TEAM_SCENARIOS;
    }

}
