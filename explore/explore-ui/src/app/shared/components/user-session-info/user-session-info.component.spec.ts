import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonUtils} from '@blk/explore-ui-core';
import {UserSessionInfoComponent} from './user-session-info.component';
import {NotificationService} from '@services/notification';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {UserSessionInfoMap} from '@models/widget/user-session-info-map.model';
import {AppStore} from '../../../app.store';
import {ReportActionType} from '@enums/report-action-type.enum';

describe('PortfolioInputPanelComponent', () => {
    let component: UserSessionInfoComponent;
    let fixture: ComponentFixture<UserSessionInfoComponent>;
    jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockImplementation(() => '-0.999999');

    const toastNotificationStb = {
        open: jest.fn(),
        close: jest.fn()
    };

    const appStore = new AppStore();

    const notificationServiceStub = {
        warning: jest.fn(),
        showDialog$: jest.fn(() => of({})),
        showToastr$: jest.fn(() => of({})),
        openDialog: jest.fn(),
        showUserSessionInfoMap$: jest.fn(() => of(undefined)),
        getCurrentUserSessionInfoMap: jest.fn(() => new UserSessionInfoMap()),
        pushLatestUserSessionInfoMap: jest.fn(),
        resetUserSessionInfo: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [UserSessionInfoComponent],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: AppStore, useValue: appStore}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(UserSessionInfoComponent);
        component = fixture.componentInstance;
        component.toastNotification = toastNotificationStb;
        fixture.detectChanges();
    });

    describe('onAlert Test', () => {

        beforeEach(() => {
            component.toastNotification.open.mockReset();
            component.toastNotification.close.mockReset();
        });

        it('should call toastNotification', () => {
            jest.spyOn(component['toastNotification'], 'open');
            component.isNotificationOpen = false;
            component.alertCount = 10;
            component.onAlertSelect();

            expect(component.toastNotification.open).toHaveBeenCalledTimes(1);
        });

        it('should not call toastNotification because it is already  open', () => {
            jest.spyOn(component['toastNotification'], 'open');

            component.isNotificationOpen = true;
            component.alertCount = 10;
            component.onAlertSelect();

            expect(component.toastNotification.open).toHaveBeenCalledTimes(0);
        });

        it('should call toastNotification because it is already  close', () => {
            jest.spyOn(component['toastNotification'], 'close');

            component.isNotificationOpen = true;
            component.alertCount = 6;
            component.onAlertSelect();

            expect(component.toastNotification.close).toHaveBeenCalledTimes(1);
        });
    });

    describe('onCancel Test', () => {

        beforeEach(() => {
            notificationServiceStub.resetUserSessionInfo.mockReset();
            notificationServiceStub.resetUserSessionInfo.mockReset();
        });

        it('should call resetuserInfoSession', (done) => {
            appStore.reportActionSubject$.next({hardRefresh: true, reportAction: ReportActionType.CANCEL_RELOAD});
            setTimeout(() => {
                expect(notificationServiceStub.resetUserSessionInfo).toHaveBeenCalledTimes(1);
                done();
            }, 2000);
        });

        it('should not callresetuserInfoSession', (done) => {
            appStore.reportActionSubject$.next({hardRefresh: true, reportAction: ReportActionType.RELOAD_REPORT});
            setTimeout(() => {
                expect(notificationServiceStub.resetUserSessionInfo).not.toHaveBeenCalled();
                done();
            }, 2000);
        });

    });
});
