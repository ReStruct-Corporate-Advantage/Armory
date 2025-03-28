import {Then} from 'cypress-cucumber-preprocessor/steps';
import {widgetPage} from '../../../integration/pages/widget/widget.page';

Then(
    /^"([^"]*)" should be displayed, aligning with the snapshot "([^"]*)"$/,
    (testWidgetTitle: string, snapshot_file_name: string) => {
        testMatchSnapshot(testWidgetTitle, snapshot_file_name, true);
    });

Then(
    /^"([^"]*)" should be displayed, aligning with the snapshot "([^"]*)" without toggle$/,
    (testWidgetTitle: string, snapshot_file_name: string) => {
        testMatchSnapshot(testWidgetTitle, snapshot_file_name, false);
    });

function testMatchSnapshot(testWidgetTitle: string, snapshot_file_name: string, useToggle: boolean): void {
    // set height and width of the widget to ensure the snapshot is consistent
    widgetPage.setWidgetHeightAndWidth(testWidgetTitle, 450, 928);
    widgetPage.refreshWidget();
    cy.matchChartSnapshot(snapshot_file_name, widgetPage.getChartWithinWidget(testWidgetTitle), useToggle);
}
