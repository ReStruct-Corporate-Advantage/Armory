import {RiskAndExposureService} from './risk-and-exposure.service';
import {TestBed} from '@angular/core/testing';
import {Http2BmsService} from '..';
import {HttpClient} from '@angular/common/http';
import {WorkspaceStore} from '../../../stores';
import {Report} from '../../../models/workspace/report.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetServiceRegistry} from './widget-service-registry';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('WidgetServiceRegistry Test', () => {
    let service: WidgetServiceRegistry;

    const httpGetMockFn = jest.fn();
    const httpPostMockFn = jest.fn();

    const httpMock = {
        get: httpGetMockFn,
        post: httpPostMockFn
    };

    const widgetServiceMock = {
        getWidgetConfigTypes: jest.fn().mockReturnValue(['TEST_WIDGET']),
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                Http2BmsService,
                { provide: HttpClient, useValue: httpMock },
                {
                    provide: AbstractWidgetService, useClass: RiskAndExposureService,
                    deps: [ExploreDataRequestService],
                    multi: true
                },
                {
                    provide: AbstractWidgetService, useValue: widgetServiceMock,
                    multi: true
                },
                {
                    provide: WidgetServiceRegistry, useClass: WidgetServiceRegistry
                }
                ],
            teardown: {
                destroyAfterEach: false
            }
        });
        service = TestBed.inject(WidgetServiceRegistry);
    });

    beforeEach( (done) => {
        WorkspaceStore.init();
        const report = new Report();
        WorkspaceStore.updateCurrentReport(report);
        TestUtils.initialize(done);
    });

    it('test getService', () => {
       expect(service.getService(WidgetConfigType.RISK_EXPOSURE)  instanceof RiskAndExposureService);
       expect(service.getService('TEST_WIDGET'));
       expect(service.getService('TEST')).not.toBe(expect.anything());
    });
});
