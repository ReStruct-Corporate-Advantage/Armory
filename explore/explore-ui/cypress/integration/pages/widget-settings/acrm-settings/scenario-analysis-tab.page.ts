import {tabBarPage} from '../../aux-components/tab-bar.page';
import {selectValueFromAuxSelect} from '../../sharedElements';

class ScenariosTabPage {
    static readonly SCENARIO_ANALYSIS_TAB_LABEL = 'Scenario Analysis';

    /**
     * Click axis tab from the main tabs on the widget settings modal
     */
    clickScenarioAnalysisTab(): void {
        tabBarPage.clickAuxTab(ScenariosTabPage.SCENARIO_ANALYSIS_TAB_LABEL);
    }

    /**
     * Click format tab from the main tabs on the widget settings modal
     */
    selectScenario(scenarioName: string): void {
        selectValueFromAuxSelect('#scenarioSelect', scenarioName);
    }
}

export const scenariosTabPage = new ScenariosTabPage();
