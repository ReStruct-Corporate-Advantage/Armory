import {When} from 'cypress-cucumber-preprocessor/steps';
import {widgetPage} from '../../../integration/pages/widget/widget.page';
import {WidgetTypeLabel} from '../../../integration/pages/widget-settings/widget-settings-modal.page';

When(/^I open widget settings modal from "([^"]*)"$/, (widgetTypeLabel: WidgetTypeLabel) => {
    widgetPage.openWidgetSettings(widgetTypeLabel);
});

When('I apply widget settings', () => {
    widgetPage.applyWidgetSettings();
});



