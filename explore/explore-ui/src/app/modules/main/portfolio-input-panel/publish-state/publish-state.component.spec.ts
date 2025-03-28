import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PublishStateComponent} from './publish-state.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PublishStateService} from '../../../../shared/services/publishState/publish-state.service';
import {PublishStateItem} from '../../../../models/publishState/publish-state-item.model';
import moment from 'moment';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {Http2BmsService} from '@services/bms';
import {ReportAction} from '@interfaces/report-action-interface';
import {of, Subject, throwError} from 'rxjs';
import {AppStore} from '../../../../app.store';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {PublishStateConstants} from '@constants/publish-state.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '../../../../stores';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {ReportActionType} from '@enums/report-action-type.enum';
import {TestUtils} from '@utils/test.utils';
import {DateValue, WidgetConfigType} from '@blk/explore-ui-core';

describe('PublishStateComponent', () => {
    let component: PublishStateComponent;
    let fixture: ComponentFixture<PublishStateComponent>;

    const publishStateServiceStub = {
        fetchPublishedState$: jest.fn()
    };

    const riskAndExposureServiceMock = {
        clearDataFromCache: jest.fn(),
        getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.RISK_EXPOSURE])
    };

    const appStoreStub = {
        reportActionSubject$: new Subject<ReportAction>()
    };

    const publishStateResults = [new PublishStateItem( 'PEP', 1, '2020-04-01T05:40:52.000Z')];

    beforeAll((done) => {
        WorkspaceStore.init();
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PublishStateComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: PublishStateService, useValue: publishStateServiceStub},
                {
                    provide: AbstractWidgetService, useValue: riskAndExposureServiceMock,
                    deps: [Http2BmsService],
                    multi: true
                },
                {
                    provide: WidgetServiceRegistry, useClass: WidgetServiceRegistry
                },
                {provide: AppStore, useValue: appStoreStub}
            ]
        });

        fixture = TestBed.createComponent(PublishStateComponent);
        component = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        component.portfolio = new Portfolio('PEP', new DateValue());
    });

    it('tests updateDuration', () => {
        Date.now = jest.fn(() => +new Date('2020-03-31T05:40:52.000Z'));

        component.lastFetchedTime = moment('2020-03-31T05:40:52.000Z');
        component.updateDuration();
        expect(component.durationSinceLastFetch).toEqual('1 minute(s) ago');

        component.lastFetchedTime = moment('2020-03-31T03:26:52.000Z');
        component.updateDuration();
        expect(component.durationSinceLastFetch).toEqual('3 hour(s) ago');

        component.lastFetchedTime = moment('2020-03-23T05:40:52.000Z');
        component.updateDuration();
        expect(component.durationSinceLastFetch).toEqual('9 day(s) ago');

        (Date.now as jest.Mock).mockRestore();
    });

    it('tests getButtonColor', () => {
        component.publishedStateResults = [];
        component.getButtonColor();
        expect(component.buttonColor).toEqual(PublishStateConstants.GREEN_STATE);

        component.publishedStateResults.push(new PublishStateItem('PEP', -1, '2020-04-02T05:40:52.000Z'));
        component.getButtonColor();
        expect(component.buttonColor).toBe(PublishStateConstants.GREEN_STATE);

        // adding an unpublished portfolio should make the button go red
        component.publishedStateResults.push(new PublishStateItem('PEP', 0, ''));
        component.getButtonColor();
        expect(component.buttonColor).toBe(PublishStateConstants.RED_STATE);
    });

    it('tests getPublishedStatus', async () => {
        const portfolio = new Portfolio();
        portfolio.publishStateWrapperSubject$.getValue().publishedStateResults = publishStateResults;
        jest.spyOn(component['publishStateService'], 'fetchPublishedState$').mockReturnValue(of(portfolio));
        await component.getPublishedStatus();
        expect(component['publishStateService'].fetchPublishedState$).toHaveBeenCalled();
    });

    it('tests getPublishedStatus for error', async () => {
        jest.spyOn(component['publishStateService'], 'fetchPublishedState$').mockReturnValue(throwError('Test Error'));
        jest.spyOn(component['notificationService'], 'error');
        await component.getPublishedStatus();
        expect(component['publishStateService'].fetchPublishedState$).toHaveBeenCalled();
        expect(component['notificationService'].error).toHaveBeenCalledTimes(1);
        expect(component.portfolio.publishStateWrapperSubject$.getValue().publishedStateResults.length).toBe(0);
    });

    it('tests refreshWidgetData', () => {
        const workpad = new FlatWorkpad();
        const reports = [];
        const report1 =  new Report();
        report1.addWidget(new Widget(WidgetConfigType.RISK_EXPOSURE));
        const report2 =  new Report();
        report2.addWidget(new Widget(WidgetConfigType.RISK_EXPOSURE));
        workpad.reports = [report1, report2];
        WorkspaceStore.updateCurrentWorkpad(workpad);
        WorkspaceStore.updateCurrentReport(report1);
        jest.spyOn(appStoreStub.reportActionSubject$, 'next');
        jest.spyOn(component, 'clearDataFromCache').mockImplementation(() => {});

        component.refreshWidgetData();
        expect(appStoreStub.reportActionSubject$.next).toHaveBeenCalledWith({hardRefresh: false, bypassBrowserCache: true, reportAction: ReportActionType.RELOAD_REPORT});
        expect(component.clearDataFromCache).toHaveBeenCalledWith(report2.widgets[0], report2);
    });

    it('tests clearDataFromCache', () => {
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const report = new Report();
        jest.spyOn(riskAndExposureServiceMock, 'clearDataFromCache');
        component.clearDataFromCache(widget, report);
        expect(riskAndExposureServiceMock.clearDataFromCache).toHaveBeenCalledWith(widget, component.portfolio, report, expect.anything());
    });
});
