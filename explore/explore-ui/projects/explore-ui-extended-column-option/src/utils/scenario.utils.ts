import {ColumnConfig, ColumnConstants, NamedScenario} from '@blk/explore-ui-core';
import {ScenarioResponse} from '../interfaces/scenario-response.interface';
import {ScenarioConstants} from '../constants/scenario.constant';
import {StressScenario} from '../models/stress-scenario.model';
import {isEmpty} from 'lodash';
import {ScenarioCategoryEnum} from '../enums/scenario-category.enum';

export class ScenarioUtils {

    public static createNamedScenarioFromScenarioResponse(scenarioRow: ScenarioResponse): NamedScenario {
        const scenario = new NamedScenario();
        scenario.name = scenarioRow.scenarioName;
        scenario.description = scenarioRow.scenarioDesc;
        scenario.code = scenarioRow.scenarioCode;
        scenario.category = ScenarioUtils.getCategoryFromScenarioResponse(scenarioRow);
        // Update in case of Aladdin scenarios
        scenario.code = ScenarioUtils.getNamedScenarioCode(scenario);
        return scenario;
    }

    public static getNamedScenarioCode(scenario: NamedScenario): string {
        return ScenarioCategoryEnum.ALADDIN_SCENARIOS === scenario.category
            ? ScenarioUtils.getNamedScenarioName(scenario)
            : scenario.code;
    }

    public static createNamedScenarioFromStressScenario(stressScenario: StressScenario): NamedScenario {
        const scenario = new NamedScenario();
        scenario.name = stressScenario.scenName;
        scenario.description = stressScenario.scenDesc;
        scenario.code = stressScenario.scenCode;
        scenario.category = stressScenario.scenCategory;
        return scenario;
    }

    public static getNamedScenarioPurpose(namedScenario: NamedScenario): string {
        const codesArray = ScenarioUtils.getScenarioCodeSplitArray(namedScenario.code);
        return codesArray.length > 1 ? codesArray[1] : undefined;
    }

    public static getNamedScenarioName(namedScenario: NamedScenario): string {
        return ScenarioUtils.getScenarioCodeSplitArray(namedScenario.code)[0];
    }

    public static getScenarioCodeForCheckingIfScenarioSelected(scenarioCode: string): string {
        const codesArray = ScenarioUtils.getScenarioCodeSplitArray(scenarioCode);
        return  codesArray.length < 2 ? codesArray[0] + ScenarioConstants.SCENARIO_CODE_SEPARATOR + ScenarioConstants.DEFAULT_SCENARIO_PURPOSE : scenarioCode;
    }

    private static getScenarioCodeSplitArray(code: string): string[] {
        return code.split(ScenarioConstants.SCENARIO_CODE_SEPARATOR).filter(a => !isEmpty(a));
    }

    public static getCategoryFromScenarioResponse(scenarioRow: ScenarioResponse): string {
        return scenarioRow.level.split(ScenarioConstants.PATH_SEPARATOR)[0];
    }

    public static getColumnFactorTag(column: ColumnConfig): string {
        if (this.isCustomFactorColumn(column.columnKey) && this.isCustomFactorTag(column.columnTag)) {
            return null;
        }
        return column.columnTag;
    }

    public static isCustomFactorColumn(columnKey: string): boolean {
        return columnKey?.startsWith(ColumnConstants.CUSTOM_FACTOR_TAG);
    }

    public static isCustomFactorTag(columnTag: string): boolean {
        return columnTag === ColumnConstants.CUSTOM_FACTOR_TAG;
    }

}
