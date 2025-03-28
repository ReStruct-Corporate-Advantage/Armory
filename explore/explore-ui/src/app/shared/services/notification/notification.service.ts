import {Injectable} from '@angular/core';
import {ExploreDialogParam, NotificationServiceInterface} from '@blk/explore-ui-core';
import {Notification} from '@models/widget/notification.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {CommonConstants} from '@constants/common.constants';
import {UserSessionInfoMap} from '@models/widget/user-session-info-map.model';
import {UserSessionInfo} from '@models/widget/user-session-info.model';
import {AuxNotificationGroupConfig} from '@blk/aladdin-angular-components';

/**
 * Notification Service
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService implements NotificationServiceInterface {
    private notificationEvent = new Subject<Notification|AuxNotificationGroupConfig>();
    private promptDialog$ = new BehaviorSubject<ExploreDialogParam>(null);
    widgetReloadPrompt$ = new Subject<Notification>();
    userSessionInfoMap$ = new BehaviorSubject<UserSessionInfoMap>(undefined);

    /**
     * Trigger when any action gets successfully completes
     */
    success(message: string): void {
        this.notificationEvent.next(Notification.createSuccessNotification(message));
    }

    detailedMessage(auxNotificationGroupConfig: AuxNotificationGroupConfig): void {
        this.notificationEvent.next(auxNotificationGroupConfig);
    }

    /**
     * Trigger when any informational message needs to show
     */
    message(message: string, showCloseButton = false): void {
        this.notificationEvent.next(Notification.createMessageNotification(message, showCloseButton));
    }

    /**
     * Alert when any warning needs to show
     */
    warning(message: string, errorType?: string, functionName?: string, showCloseButton?: boolean): void {
        this.notificationEvent.next(Notification.createWarningNotification(message, errorType, functionName, showCloseButton));
    }

    /**
     * Alert when any error needs to show
     */
    error(message: string, errorType?: string, functionName?: string, showCloseIcon?: boolean): void {
        this.notificationEvent.next(Notification.createErrorNotification(message, errorType, functionName, showCloseIcon));
    }

    /**
     * Alert when any error needs to show
     */
    pushLatestUserSessionInfoMap(userSessionInfo: UserSessionInfo): void {
        let currentSessionInfoMap = this.getCurrentUserSessionInfoMap();
        if (!currentSessionInfoMap) {
            currentSessionInfoMap = new UserSessionInfoMap();
        }
        const updatedMap = currentSessionInfoMap.updateMap(userSessionInfo);
        if (updatedMap) {
            this.userSessionInfoMap$.next(currentSessionInfoMap);
        }
    }

    /**
     * Reset the UserSession info
     */
    resetUserSessionInfo(): void {
        this.userSessionInfoMap$.next(new UserSessionInfoMap());
    }

    /**
     * Show Toastr
     */
    showToastr$(): Observable<Notification|AuxNotificationGroupConfig> {
        return this.notificationEvent;
    }

    /**
     * Show user throttled session info
     */
    showUserSessionInfoMap$(): Observable<UserSessionInfoMap> {
        return this.userSessionInfoMap$;
    }

    /**
     * Show Toastr
     */
    getCurrentUserSessionInfoMap(): UserSessionInfoMap {
        return this.userSessionInfoMap$.getValue();
    }

    /**
     * Open dialog with dialogParam
     */
    openDialog(dialogParam: ExploreDialogParam): void {
        this.promptDialog$.next(dialogParam);
    }

    /**
     * Show Dialog
     */
    showDialog$(): Observable<ExploreDialogParam> {
        return this.promptDialog$;
    }

    /**
     * function to invoke widget reload prompt
     */
    invokeWidgetReloadPrompt(): void {
        this.widgetReloadPrompt$.next(new Notification(`${CommonConstants.WIDGET_RELOAD_MESSAGE} message`, CommonConstants.WIDGET_RELOAD_MESSAGE, 'message', [
            { type: 'button', buttonType: 'primary', label: 'Reload Now' }
        ]));
    }
}
