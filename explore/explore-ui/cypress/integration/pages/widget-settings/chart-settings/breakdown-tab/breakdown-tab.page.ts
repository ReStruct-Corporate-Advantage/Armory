import {tabBarPage} from '../../../aux-components/tab-bar.page';
import {radioPage} from '../../../aux-components/radio.page';

class BreakDwonTabPage {
    static readonly BREAKDOWN_TAB_LABEL = 'Breakdown';

    private getBreakDownSelector = (breakDownType: BreakDownType): string => `app-widget-level-breakdown-settings[title="${breakDownType}"]`;

    /**
     * Click breakdown tab from the main tabs on the widget settings modal
     */
    clickBreakdownTab(): void {
        tabBarPage.clickAuxTab(BreakDwonTabPage.BREAKDOWN_TAB_LABEL);
    }

    /**
     * Select No BreakDown radio for Sector Breakdown
     */
    selectSectorNoBreakDownRadio(breakDownType = BreakDownType.SECTOR_BREAKDOWN): void {
        const breakDownSelectorSector = this.getBreakDownSelector(breakDownType);
        radioPage.getAuxRadio(BreakDownLabel.NO_BREAKDOWN, breakDownSelectorSector)
            .scrollIntoView()
            .then(() => {
                radioPage.clickAuxRadio(BreakDownLabel.NO_BREAKDOWN, breakDownSelectorSector);
            });
    }

     /**
     * Select No BreakDown radio for stacked Breakdown
     */
     selectStackedNoBreakDownRadio(breakDownType = BreakDownType.STACKED_BREAKDOWN): void {
        const breakDownSelectorStacked = this.getBreakDownSelector(breakDownType);
        radioPage.getAuxRadio(BreakDownLabel.NO_BREAKDOWN, breakDownSelectorStacked)
            .scrollIntoView()
            .then(() => {
                radioPage.clickAuxRadio(BreakDownLabel.NO_BREAKDOWN, breakDownSelectorStacked);
            });
            cy.wait(5000);
    }
}

enum BreakDownType {
    SECTOR_BREAKDOWN = 'Sector Breakdown',
    STACKED_BREAKDOWN = 'Stacked Breakdown'
}

enum BreakDownLabel {
    NO_BREAKDOWN = 'No breakdown',
    QUICK_GROUPING = 'Quick grouping',
    CONFIGURABLE_BREAKDOWN = 'Configurable breakdown'
}



export const breakdownTabPage = new BreakDwonTabPage();
