import {When} from 'cypress-cucumber-preprocessor/steps';
import {widgetPage} from '../../../integration/pages/widget/widget.page';

When('I maximize widget', () => {
    widgetPage.maximizeWidget();
});

When(/^I maximize "([^"]*)" widget$/, (widgetTitle: string) => {
    widgetPage.maximizeWidget(widgetTitle);
});

When(/^I delete "([^"]*)" widget$/, (widgetTitle: string) => {
    widgetPage.deleteWidget(widgetTitle);
});
