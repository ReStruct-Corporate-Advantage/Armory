import {sharedElements} from '../sharedElements';
import {widgetSettingsModalPage, WidgetTypeLabel} from '../widget-settings/widget-settings-modal.page';
import {ButtonIdentifierType, buttonPage} from '../aux-components/button.page';
import {inlineMenuPage} from '../aux-components/inline-menu.page';
import {CommonLocators} from '../../constants/common-locators';
import {AuxComponents, AuxIcons} from '../aux-components/ds.aux.enum';
import {deleteWidgetAlertPage} from '../delete-widget-alert.page';

export class WidgetPage {
    private readonly SETTINGS_LABEL = 'Settings';
    private readonly MAXIMIZE_LABEL = 'Maximize';
    private readonly DELETE_LABEL = 'Delete';
    private readonly REFRESH_LABEL = 'Refresh';

    /**
     * Get widget with the widget name
     */
    getWidget = (widgetName: string): Cypress.Chainable<JQuery> => cy.get(AuxComponents.WIDGET + '[header="' + widgetName + '"]');

    /**
     * Apply widget settings
     */
    applyWidgetSettings(): void {
        widgetSettingsModalPage.clickDoneButton()
            .then(() => {
                sharedElements.loadingSpinner().should('not.exist');
            });
    }

    getWidgetGridsterItem = (widgetName: string): Cypress.Chainable<JQuery> => cy.get(`gridster-item:has('aux-widget[header="${widgetName}"]')`);

    /**
     * Get chart within the widget
     */
    getChartWithinWidget(widgetName: string): Cypress.Chainable<JQuery> {
        return this.getWidget(widgetName).find('.aux-widget__content-container');
    }

    setWidgetHeightAndWidth(widgetName: string, height: number, width: number): void {
        this.getWidgetGridsterItem(widgetName).within(($el) => {
            cy.wrap($el).invoke('css', { height: height + 'px', width: width + 'px' })
                .should('have.css', 'height', height + 'px')
                .and('have.css', 'width', width + 'px');
        });
    }

    /**
     * Open widget settings
     */
    openWidgetSettings(widgetTypeLabel: WidgetTypeLabel, widgetTitle?: string): void {
        const context = this.getWidgetHeaderToolbarWrapper(widgetTitle);
        this.performWidgetHeaderAction(this.SETTINGS_LABEL, AuxIcons.WIDGET_SETTINGS, context)
            .then(() => {
                widgetSettingsModalPage.getWidgetSettingsModalHeader(widgetTypeLabel).should('be.visible');
            });
    }

    /**
     * Maximize widget
     */
    maximizeWidget(widgetTitle?: string): void {
        const context = this.getWidgetHeaderToolbarWrapper(widgetTitle);
        this.performWidgetHeaderAction(this.MAXIMIZE_LABEL, AuxIcons.WIDGET_MAXIMIZE, context)
            .then(() => {
                buttonPage.getAuxButton('widget-minimize', ButtonIdentifierType.ICON).should('be.visible');
                // we wait because it takes some time for elemnet to adjust to new height and render
                cy.wait(1000);
            });
    }

    deleteWidget(widgetTitle?: string): void {
        const context = this.getWidgetHeaderToolbarWrapper(widgetTitle);
        this.performWidgetHeaderAction(this.DELETE_LABEL, AuxIcons.WIDGET_DELETE, context)
            .then(() => {
                deleteWidgetAlertPage.deleteWidget();
            });
    }

    refreshWidget(): void {
        this.performWidgetHeaderAction(this.REFRESH_LABEL, AuxIcons.WIDGET_REFRESH)
            .then(() => {
                sharedElements.loadingSpinner().should('not.exist');
                cy.wait(2000);
            });
    }

    /**
     * Perform widgetHeader action
     */
    private performWidgetHeaderAction(actionLabel: string, actionIcon: string, context?: Cypress.Chainable<JQuery>): Cypress.Chainable<JQuery> {
        return this.performWidgetHeaderActionWithRetry(actionLabel, actionIcon, 5, context);
    }

    private performWidgetHeaderActionWithRetry(actionLabel: string, actionIcon: string, retry: number, context?: Cypress.Chainable<JQuery>): Cypress.Chainable<JQuery> {
        return cy.get('body').then(() => {
            return buttonPage.getAuxButton(actionIcon, ButtonIdentifierType.ICON, context)
                .then(($button: any) => {
                    if (!$button || $button.length === 0) {
                        return cy.wait(5000).then(() => this.performWidgetHeaderActionWithRetry(actionLabel, actionIcon, retry - 1, context));
                    } else if ($button.is(':visible')) {
                        return context ? $button.click() : cy.wrap($button).click();
                    } else if (retry > 0) {
                        return cy.wait(5000).then(() => this.performWidgetHeaderActionWithRetry(actionLabel, actionIcon, retry - 1, context));
                    } else {
                        return this.performInlineWidgetHeaderAction(actionLabel, actionIcon, context);
                    }
                });
        });
    }
    private performInlineWidgetHeaderAction(actionLabel: string, actionIcon: string, context?: Cypress.Chainable<JQuery>): Cypress.Chainable<JQuery> {
        return cy.get(CommonLocators.BODY)
            .then(($body) => {
                // If overflow menu button is in DOM, click the button and see if the overflow menu is also in the DOM.
                inlineMenuPage.clickAuxOverflowMenuButton(context)
                    .then(() => {
                        cy.wrap($body).within(() => {
                            if (cy.get(inlineMenuPage.overflowMenuSelector).should('be.visible')) {
                                inlineMenuPage.clickAuxOverflowMenu(actionLabel);
                            } else {
                                buttonPage.clickAuxButton(actionIcon, ButtonIdentifierType.ICON);
                            }
                        });
                    });
            });
    }

    /**
     * Get widget header toolbar wrapper for given widget Title
     */
    private getWidgetHeaderToolbarWrapper(widgetTitle: string): Cypress.Chainable<JQuery> {
        if (!widgetTitle) {
            return null;
        }
        return cy.contains('.aux-widget__header--label-inner', widgetTitle)
            .closest('.aux-widget__header-container')
            .find('.aux-widget__header--toolbar-wrapper');
    }
}

export const widgetPage = new WidgetPage();
