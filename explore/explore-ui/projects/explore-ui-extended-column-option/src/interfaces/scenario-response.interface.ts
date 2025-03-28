
export interface ScenarioResponse {
    level: string;
    scenarioName: string;
    scenarioDesc?: string;
    scenarioCode?: string;
    scenarioPurpose?: string; // show data only in case of Team Scenarios
    scenarioCreatedDate?: string;

    // UI params
    scenarioSelected?: boolean; // to mark scenario as selected
    actionCol?: any; // to show action col menu items
}
