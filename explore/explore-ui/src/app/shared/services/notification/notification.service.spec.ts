import {TestBed} from '@angular/core/testing';
import {NotificationService} from './notification.service';
import {AlertConstants} from '../../../constants';
import {UserSessionInfo} from '@models/widget/user-session-info.model';
import {UserSessionInfoMap} from '@models/widget/user-session-info-map.model';

describe('Notification Service', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('success notification test case', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        service.success('Success Notification message');
        service.showToastr$().subscribe((notification) => {
           expect(notification.message).toBe('Success Notification message');
           expect(notification.notificationStyle).toBe(AlertConstants.NOTIFICATION_STYLE.SUCCESS);
        });
    });

    it('message notification test case', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        service.message('Message Notification message');
        service.showToastr$().subscribe((notification) => {
            expect(notification.message).toBe('Message Notification message');
            expect(notification.notificationStyle).toBe(AlertConstants.NOTIFICATION_STYLE.MESSAGE);
        });
    });

    it('warning notification test case', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        service.warning('warning Notification message');
        service.showToastr$().subscribe((notification) => {
            expect(notification.message).toBe('warning Notification message');
            expect(notification.notificationStyle).toBe(AlertConstants.NOTIFICATION_STYLE.WARNING);
        });
    });

    it('error notification test case', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        service.error('Error Notification message');
        service.showToastr$().subscribe((notification) => {
            expect(notification.message).toBe('Error Notification message');
            expect(notification.notificationStyle).toBe(AlertConstants.NOTIFICATION_STYLE.ERROR);
        });
    });

    it('widgetReloadPrompt test case', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        jest.spyOn(service['widgetReloadPrompt$'], 'next');
        service.invokeWidgetReloadPrompt();
        expect(service['widgetReloadPrompt$'].next).toHaveBeenCalledWith({
                'buttons': [{
                    'buttonType': 'primary',
                    'label': 'Reload Now',
                    'type': 'button'
                }],
                'id': 'You have made changes to Portfolio inputs. Click \'Reload Now\' to refresh the report. message',
                'message': 'You have made changes to Portfolio inputs. Click \'Reload Now\' to refresh the report.',
                'notificationStyle': 'message'
            }
        );
    });


    it('pushLatestUserSessionInfoMap test case -- first notification for server1', () => {
        const service: NotificationService = TestBed.inject(NotificationService);

        const spy = jest.spyOn(service, 'getCurrentUserSessionInfoMap').mockReturnValue(undefined);

        jest.spyOn(service['userSessionInfoMap$'], 'next');
        const userInfoSession = new UserSessionInfo({   serverId: 'server1',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });

        service.pushLatestUserSessionInfoMap(userInfoSession);
        expect(service['userSessionInfoMap$'].next).toHaveBeenCalled();
    });

    it('pushLatestUserSessionInfoMap test case  -- first notification for server1 ', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        jest.spyOn(service['userSessionInfoMap$'], 'next');
        const userInfoSession1 = new UserSessionInfo({   serverId: 'server1',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });

        const sessionMap = new UserSessionInfoMap();
        sessionMap.updateMap(userInfoSession1);

        const spy = jest.spyOn(service, 'getCurrentUserSessionInfoMap').mockReturnValue(sessionMap);

        // push in server 2 notification
        const userInfoSession2 = new UserSessionInfo({   serverId: 'server2',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });
        service.pushLatestUserSessionInfoMap(userInfoSession2);

        // should be invoked
        expect(service['userSessionInfoMap$'].next).toHaveBeenCalled();
    });

    it('reset test case  -- first notification for server1 ', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        jest.spyOn(service['userSessionInfoMap$'], 'next');
        const userInfoSession1 = new UserSessionInfo({   serverId: 'server1',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });

        const sessionMap = new UserSessionInfoMap();
        sessionMap.updateMap(userInfoSession1);

        const spy = jest.spyOn(service, 'getCurrentUserSessionInfoMap').mockReturnValue(sessionMap);

        // push in server 2 notification
        const userInfoSession2 = new UserSessionInfo({   serverId: 'server2',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });
        service.pushLatestUserSessionInfoMap(userInfoSession2);
        // should be invoked
        expect(service['userSessionInfoMap$'].next).toHaveBeenCalled();

        service.resetUserSessionInfo();
        // should be invoked
        expect(service['userSessionInfoMap$'].next).toHaveBeenCalledWith(new UserSessionInfoMap());
    });

    it('pushLatestUserSessionInfoMap test case  -- latest notification for server1 ', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        jest.spyOn(service['userSessionInfoMap$'], 'next');

        const userInfoSession1 = new UserSessionInfo({   serverId: 'server1',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });

        const userInfoSession2 = new UserSessionInfo({   serverId: 'server2',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });

        const sessionMap = new UserSessionInfoMap();
        sessionMap.updateMap(userInfoSession1);
        sessionMap.updateMap(userInfoSession2);

        const spy = jest.spyOn(service, 'getCurrentUserSessionInfoMap').mockReturnValue(sessionMap);

        const userInfoSession3Server1 = new UserSessionInfo({   serverId: 'server1',
            timestamp: 12345,
            queuedRequests: 1,
            runningRequests: 1
        });

        // push server1 notification -- this is latest than already existing
        service.pushLatestUserSessionInfoMap(userInfoSession3Server1);

        // should be invoked
        expect(service['userSessionInfoMap$'].next).toHaveBeenCalled();
    });

    it('pushLatestUserSessionInfoMap test case  -- stale notification for server1 ', () => {
        const service: NotificationService = TestBed.inject(NotificationService);
        jest.spyOn(service['userSessionInfoMap$'], 'next');

        const userInfoSession1 = new UserSessionInfo({   serverId: 'server1',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });

        const userInfoSession2 = new UserSessionInfo({   serverId: 'server2',
            timestamp: 1234,
            queuedRequests: 1,
            runningRequests: 1
        });

        const sessionMap = new UserSessionInfoMap();
        sessionMap.updateMap(userInfoSession1);
        sessionMap.updateMap(userInfoSession2);

        const spy = jest.spyOn(service, 'getCurrentUserSessionInfoMap').mockReturnValue(sessionMap);

        const userInfoSession3Server1 = new UserSessionInfo({   serverId: 'server1',
            timestamp: 123,
            queuedRequests: 1,
            runningRequests: 1
        });

        // push server1 notification -- this is older than already existing
        service.pushLatestUserSessionInfoMap(userInfoSession3Server1);

        // should be invoked
        expect(service['userSessionInfoMap$'].next).not.toHaveBeenCalled();
    });
});
