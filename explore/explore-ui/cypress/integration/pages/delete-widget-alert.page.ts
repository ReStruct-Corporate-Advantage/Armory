import {buttonPage, ButtonIdentifierType} from './aux-components/button.page';

class DeleteWidgetAlertPage {

    /**
     * Delete widget
     */
    deleteWidget(): void {
        buttonPage.clickAuxButton('Remove', ButtonIdentifierType.LABEL, null, true);
    }

    cancelDeleteWidget(): void {
        buttonPage.clickAuxButton('Cancel', ButtonIdentifierType.LABEL, null, true);
    }
}

export const deleteWidgetAlertPage = new DeleteWidgetAlertPage();
