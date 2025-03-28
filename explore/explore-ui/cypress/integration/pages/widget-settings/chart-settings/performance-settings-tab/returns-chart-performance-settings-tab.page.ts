import {numericStepperPage} from '../../../aux-components/numeric-stepper.page';
import {tabBarPage} from '../../../aux-components/tab-bar.page';

class ReturnsChartPerformanceSettingsTabPage {

    /**
     * Click performance settings tab from the main tabs on the widget settings modal
     */
    clickPerformanceSettingsTab(numberOfPeriod: string, frequency: string): void {
        cy.mockGetTimePeriodDatesAndName(numberOfPeriod, frequency);
        tabBarPage.clickAuxTab('Performance Settings');
    }

    /**
     * Set number of periods in numeric stepper
     */
    setNumberOfPeriodsNumericStepper(input: string): void {
        numericStepperPage.setInputInNumericStepper('Number of periods', input);
    }
}

export const returnsChartPerformanceSettingsTabPage = new ReturnsChartPerformanceSettingsTabPage();
