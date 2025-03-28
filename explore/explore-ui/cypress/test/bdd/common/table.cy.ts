import {When} from 'cypress-cucumber-preprocessor/steps';
import {
    gridPage,
    RightClickMenuOption,
    RightClickSubMenuOption
} from '../../../integration/pages/aux-components/grid.page';

When(/^I expand "([^"]*)" row$/, (rowDescriptionTitle: string) => {
    gridPage.expandRow(rowDescriptionTitle);
});

When(/^I right click on "([^"]*)" cell to open context menu and click on "([^"]*)"$/, (firstCellTitle: string, menuOptionLabel: RightClickMenuOption) => {
    gridPage.performRightClickAction(firstCellTitle, menuOptionLabel);
});

When(/^I right click on "([^"]*)" cell to open context menu, hover on "([^"]*)", then click on "([^"]*)"$/, (firstCellTitle: string, menuOptionLabel: RightClickMenuOption, subMenuOptionLabel: RightClickSubMenuOption) => {
    gridPage.performRightClickAction(firstCellTitle, menuOptionLabel, subMenuOptionLabel);
});
