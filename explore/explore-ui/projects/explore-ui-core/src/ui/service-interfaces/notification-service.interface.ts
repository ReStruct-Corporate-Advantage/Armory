/**
 * NotificationServiceInterface
 * Library Consumers can implement this interface and provide the token: NOTIFICATION_SERVICE_TOKEN
 */
import {ExploreDialogParam} from '../models/explore-dialog-param.model';

export interface NotificationServiceInterface {
    success(message: string): void;

    warning(message: string): void;

    error(message: string): void;

    openDialog(dialogParam: ExploreDialogParam): void;
}
