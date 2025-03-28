import {PieChartWidgetDataService} from './pie-chart-widget-data.service';
import {validateService} from '@services/widget/functions-for-data-service.testutil';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('PieChartWidgetDataService Test', () => {

    let service: PieChartWidgetDataService;

    /**
     * Performs required initialisation
     */
    beforeEach(() => {
        service = new PieChartWidgetDataService(null);
    });


    it('Should create service', () => {
        expect(service).toBeTruthy();
    });

    it('Should call modify widget Inputs service', () => {
        service['modifyWidgetInputsForRequest'](new Map(), null);
        expect(service).toBeTruthy();
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.PIE], 'Y');
    });

});
