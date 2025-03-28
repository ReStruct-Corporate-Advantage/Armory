import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AuxNotificationGroup} from '@blk/aladdin-angular-components';
import {NotificationService} from '@services/notification';
import {takeUntil} from 'rxjs/operators';
import {Notification} from '@models/widget/notification.model';
import {ReportActionType} from '@enums/report-action-type.enum';
import {AppStore} from '../../../app.store';
import {CoreDefinitionStore, SubscribableComponent, TokenConstants} from '@blk/explore-ui-core';

@Component({
    selector: 'app-user-session-info',
    templateUrl: './user-session-info.component.html'
})
/**
 * Component for Advanced Tree List
 */
export class UserSessionInfoComponent extends SubscribableComponent implements OnInit {

    // toast notification
    @ViewChild('toastNotification', {static: true}) toastNotification: AuxNotificationGroup;

    alertMessage: string;
    alertCount = 0;
    isNotificationOpen: boolean;
    tokenValue: number;
    readonly tokenConstant = TokenConstants.EXPLORE_NOTIFY_MAX_USER_THREAD_MESSAGE;

    constructor(private appStore: AppStore, private notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        const maxUserThread = Number(CoreDefinitionStore.tokens[this.tokenConstant]) ;

        this.tokenValue = maxUserThread ? maxUserThread : 6;

        // keep aggregating sys messages
        this.notificationService.showUserSessionInfoMap$().pipe(takeUntil(this.ngUnsubscribe)).subscribe((userSessionInfoMap) => {
            if (userSessionInfoMap) {
                this.alertCount = userSessionInfoMap.getCombinedRequestCount();
                this.alertMessage = 'Processing ' + this.alertCount + ' Widgets';
                this.changeDetectorRef.markForCheck();
                this.onAlertSelect();
            }
        });

        this.appStore.reportActionSubject$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((reportAction) => {
            // add a delay of 1 sec to reset the counter
            if (reportAction.reportAction === ReportActionType.CANCEL_RELOAD) {
                this.alertCount = 0;
                this.changeDetectorRef.markForCheck();
                this.notificationService.resetUserSessionInfo();
            }
        });
    }

    /**
     * Open notification when criteria is met
     */
    onAlertSelect() {
        if (this.isNotificationOpen && (this.alertCount <= this.tokenValue)) {
            this.isNotificationOpen = false;
            this.toastNotification?.close(`${'userSessionInfo'}`);
        }
        if ((this.alertCount > this.tokenValue)  && !this.isNotificationOpen) {
            this.isNotificationOpen = true;
            this.toastNotification?.open(Notification.createPersistentErrorNotificationWithId('userSessionInfo', 'Explore has a temporary limit to control multiple requests made to the server (server throttling). Wait until this error message disappears to load additional widgets.').toPlainObj());
        }
    }

}
