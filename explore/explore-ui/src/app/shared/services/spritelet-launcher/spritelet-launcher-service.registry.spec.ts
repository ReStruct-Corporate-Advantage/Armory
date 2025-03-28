import {TestBed} from '@angular/core/testing';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';
import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {ReturnTimeSeriesSpriteletLauncherService} from '@services/spritelet-launcher/return-time-series-spritelet-launcher.service';
import {PerformanceConstants} from '@blk/explore-ui-core';
import {ReturnDrillDownTimeSeriesSpriteletLauncherService} from '@services/spritelet-launcher/return-drill-down-time-series-spritelet-launcher.service';
import {ReturnPerformanceDetailSpriteletLauncherService} from '@services/spritelet-launcher/return-performance-detail-spritelet-launcher.service';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ReturnDrillDownPerformanceDetailsSpriteletLauncherService} from '@services/spritelet-launcher/return-drill-down-performance-details-spritelet-launcher.service';

describe('SpriteletLauncherServiceRegistry Test', () => {
    let service: SpriteletLauncherServiceRegistry;
    const httpGetMockFn = jest.fn();
    const httpPostMockFn = jest.fn();

    const httpMock = {
        get: httpGetMockFn,
        post: httpPostMockFn
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                ReportColumnService,
                { provide: HttpClient, useValue: httpMock },
                {
                    provide: AbstractSpriteletLauncherService, useClass: ReturnTimeSeriesSpriteletLauncherService,
                    multi: true
                },
                {
                    provide: AbstractSpriteletLauncherService, useClass: ReturnDrillDownTimeSeriesSpriteletLauncherService,
                    multi: true
                },
                {
                    provide: AbstractSpriteletLauncherService, useClass: ReturnPerformanceDetailSpriteletLauncherService,
                    deps: [ReportColumnService],
                    multi: true
                },
                {
                    provide: AbstractSpriteletLauncherService, useClass: ReturnDrillDownPerformanceDetailsSpriteletLauncherService,
                    deps: [ReportColumnService],
                    multi: true
                },
                {
                    provide: SpriteletLauncherServiceRegistry, useClass: SpriteletLauncherServiceRegistry
                }
            ],
            teardown: {
                destroyAfterEach: false
            },
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        service = TestBed.inject(SpriteletLauncherServiceRegistry);
    });

    it('test getSpriteletLauncherService', () => {
        expect(service.getSpriteletLauncherService(PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES)  instanceof ReturnTimeSeriesSpriteletLauncherService);
        expect(service.getSpriteletLauncherService(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_TIME_SERIES)  instanceof ReturnDrillDownTimeSeriesSpriteletLauncherService);
        expect(service.getSpriteletLauncherService(PerformanceConstants.SPRITELET_EVENTS.RETURN_PERF_DETAILS)  instanceof ReturnPerformanceDetailSpriteletLauncherService);
        expect(service.getSpriteletLauncherService(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_PERF_DETAILS)  instanceof ReturnDrillDownPerformanceDetailsSpriteletLauncherService);
    });
});
