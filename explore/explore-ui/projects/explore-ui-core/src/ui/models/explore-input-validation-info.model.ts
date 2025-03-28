import {NotificationType} from '../enums';

/**
 * Model class containing validation info for custom calc regex
 */
export class ExploreInputValidationInfo {

    notificationType: NotificationType;  // Type of notification i.e. Error or Warning.
    message: string;  // Warning/Error Message if input is not valid.

    /**
     * Create instance of validation summary.
     */
    constructor(notificationType: NotificationType, message: string) {
        this.notificationType = notificationType;
        this.message = message;
    }
}
