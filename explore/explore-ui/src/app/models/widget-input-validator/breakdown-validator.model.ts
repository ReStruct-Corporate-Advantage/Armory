import {AlertConstants} from '@blk/explore-ui-core';
import {NotificationConstants} from '@constants/notification.constants';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Portfolio} from '../portfolio/portfolio.model';
import {Notification} from '../widget/notification.model';
import {BaseWidgetInputValidator} from './base-widget-input-validator.model';

export class BreakdownValidator extends BaseWidgetInputValidator {

    /**
     * validate breakdown for provided conditions and return notification in case of error
     */
    validateInput(breakdown: Breakdown, portfolio: Portfolio): Notification {
        return this.validateBreakdownForIndexPortfolio(breakdown, portfolio);
    }

    /**
     * Validate  breakdown for index research portfolio for request support
     */
    private validateBreakdownForIndexPortfolio(breakdown: Breakdown, portfolio: Portfolio): Notification {
        // Check if point in time portfolios are supported by this service
        return portfolio && portfolio.isIndexResearchPortfolio && breakdown.hasGRSectorColumn()
            ? new Notification(`${NotificationConstants.INDEX_PORT_BREAKDOWN_MESSAGE} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, NotificationConstants.INDEX_PORT_BREAKDOWN_MESSAGE, AlertConstants.NOTIFICATION_STYLE.ERROR)
            : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validateInputForWarning(_widgetInput: Breakdown): string[] {
        return null;
    }
}
