import {Portfolio} from '../portfolio/portfolio.model';
import {Notification} from '../widget/notification.model';
import {WidgetInput} from '@blk/explore-ui-core';
import {Widget} from "@models/widget/widget.model";

/**
 * Base widget input validator class
 */
export abstract class BaseWidgetInputValidator {
    /**
     * validates this widget input and returns a notification object in case of error
     */
    abstract validateInput(widgetInput: WidgetInput, portfolio: Portfolio, widget?: Widget): Notification;

    /**
     * validate this widget input and returns a notification message array in case of any warnings
     */
    abstract validateInputForWarning(widgetInput: WidgetInput): string[];
}
