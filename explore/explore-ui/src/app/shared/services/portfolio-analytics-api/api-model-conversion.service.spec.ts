import {ApiModelConversionService} from '@services/portfolio-analytics-api/api-model-conversion.service';
import {TestBed} from '@angular/core/testing';
import {Http2BmsService} from '@services/bms';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {WidgetServiceRegistry} from '@services/widget/widget-service-registry';
import {ApiRequestUtils} from '@utils/api-request.utils';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {of} from 'rxjs';

describe('ApiModelConversionService', () => {
    let service: ApiModelConversionService;

    const httpServiceStub = {
        post$: jest.fn()
    };

    const riskAndExposureServiceMock = {
        extractDataAndStore: jest.fn(),
        getWidgetConfigTypes: jest.fn(() => [WidgetConfigType.RISK_EXPOSURE]),
        createFinalDataRequest: jest.fn()
    };

    const widgetServiceRegistryMock = {
        getService: jest.fn(() => riskAndExposureServiceMock)
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Http2BmsService, useValue: httpServiceStub},
                {provide: WidgetServiceRegistry, useValue: widgetServiceRegistryMock},
            ]
        });
        service = TestBed.inject(ApiModelConversionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getGenerateApiRequestPayload should generate successfully', () => {
        jest.spyOn(ApiRequestUtils, 'postProcessRequestParams').mockImplementation(() => {});
        jest.spyOn(WorkspaceStore, 'getCurrentReport').mockImplementation(() => {});
        const reqPayload = {
            type: WidgetConfigType.RISK_EXPOSURE
        };
        riskAndExposureServiceMock.createFinalDataRequest.mockReturnValue({
            requestParams: [reqPayload]
        });
        const widget = new Widget();
        widget.configType = WidgetConfigType.RISK_EXPOSURE;
        widget.dataStore = {
            metaData: {
                inputs: []
            }
        };
        const portfolio = new Portfolio('PEP');
        const payload = service.getGenerateApiRequestPayload(widget, portfolio);
        expect(payload['widgetType']).toBe(WidgetConfigType.RISK_EXPOSURE);
        expect(payload['prismWebRequest']).toBe(reqPayload);
    });

    it('convertExploreModelToApiModel$ test', () => {
        httpServiceStub.post$.mockReturnValue(of({
            data: 'data',
        }));
        service.convertExploreModelToApiModel$({}, 'message').subscribe((response) => {
            expect(response).toBe('data');
        });
        httpServiceStub.post$.mockReturnValue(of({}));
        service.convertExploreModelToApiModel$({}, 'message').subscribe(() => {}, (error) => {
            expect(error).toBeTruthy();
        });
    });
});
