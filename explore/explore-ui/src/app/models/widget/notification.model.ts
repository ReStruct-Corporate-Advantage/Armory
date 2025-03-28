import {isEmpty} from 'lodash';
import {AlertConstants} from '@blk/explore-ui-core';
import {AuxNotificationToastTypeEnum} from '@blk/aladdin-angular-components';

/**
 * Notification model that will be displayed at App level or widget level
 */
export class Notification {

    notificationStyle: string;

    message: string;
    id: string;
    errorType: string;
    widgetConfigType: string;
    widgetTitle: string;
    functionName: string;

    buttons: Array<{ type: string, buttonType: string, label: string }>;
    toastType: string;
    showCloseIcon: boolean;

    constructor(id: string, message: string, notificationStyle: string, buttons?: Array<{ type: string, buttonType: string, label: string }>, showCloseIcon?: boolean, errorType?: string, functionName?: string) {
        this.id = id;
        this.message = message;
        this.notificationStyle = notificationStyle;
        this.errorType = errorType;
        this.functionName = functionName;
        if (!isEmpty(buttons)) {
            this.buttons = buttons;
        }
        if (showCloseIcon) {
            this.toastType = AuxNotificationToastTypeEnum.PERSISTENT;
            this.showCloseIcon = true;
        }
    }

    /**
     * Create a valid notification id out of the given message
     * Removes all characters other than alphabets
     * @param message
     * @private
     */
    private static createValidNotificationIdFromMessage(message: string): string {
        return message.replace(/[^a-zA-Z]/g, '');
    }

    /**
     * ERROR notification
     */
    public static createErrorNotification(message: string, errorType?: string, functionName?: string, showCloseIcon?: boolean): Notification {
        const notificationId = this.createValidNotificationIdFromMessage(message) + AlertConstants.NOTIFICATION_STYLE.ERROR;
        return new Notification(notificationId, message, AlertConstants.NOTIFICATION_STYLE.ERROR, undefined, showCloseIcon, errorType, functionName);
    }

    /**
     * ERROR notification
     */
    public static createErrorNotificationWithId(id: string, message: string): Notification {
        return new Notification(`${id}`, message, AlertConstants.NOTIFICATION_STYLE.ERROR);
    }

    /**
     * ERROR notification
     */
    public static createPersistentErrorNotificationWithId(id: string, message: string): Notification {
        const notification = new Notification(`${id}`, message, AlertConstants.NOTIFICATION_STYLE.ERROR);
        notification.toastType = AuxNotificationToastTypeEnum.PERSISTENT;
        return notification;
    }
    /**
     * ERROR notification
     */
    public static createMessageNotification(message: string, showCloseButton = false): Notification {
        return new Notification(`${message} ${AlertConstants.NOTIFICATION_STYLE.MESSAGE}`, message, AlertConstants.NOTIFICATION_STYLE.MESSAGE, undefined, showCloseButton);
    }

    /**
     * SUCCESS notification
     */
    public static createSuccessNotification(message: string): Notification {
        return new Notification(`${message} ${AlertConstants.NOTIFICATION_STYLE.SUCCESS}`, message, AlertConstants.NOTIFICATION_STYLE.SUCCESS);
    }

    /**
     * Warning notification
     */
    public static createWarningNotification(message: string, errorType?: string, functionName?: string, showCloseButton?: boolean): Notification {
        return new Notification(`${message} ${AlertConstants.NOTIFICATION_STYLE.WARNING}`, message, AlertConstants.NOTIFICATION_STYLE.WARNING, undefined, showCloseButton, errorType, functionName);
    }

    /**
     * Convert to simple javascript object
     */
    public toPlainObj(): any {
        return Object.assign({}, this);
    }

    /**
     * Check for empty notification
     */
    public isEmpty(): boolean {
        return isEmpty(this.message);
    }
}
