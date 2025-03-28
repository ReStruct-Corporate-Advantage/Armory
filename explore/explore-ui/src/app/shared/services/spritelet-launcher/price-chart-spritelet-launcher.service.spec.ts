import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {Widget} from '@models/widget/widget.model';
import {WidgetConstants} from '@constants/widget.constants';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {PriceChartInputs} from '@models/price-chart-inputs/price-chart-inputs.model';
import {PriceChartSpriteletLauncherService} from './price-chart-spritelet-launcher.service';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for PriceChartSpriteletLauncherService
 */
describe('PriceChartSpriteletLauncherService', () => {
    let service: PriceChartSpriteletLauncherService;
    beforeAll(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PriceChartSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_KEY);
    });

    it('test launchSpritelet', (done) => {
        TestUtils.initialize(done);
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const params: any = {
            value: 'Label',
            node: {
                data: {
                    'cusip_0': 'cusip',
                    'security_description_1': 'Label'
                }
            },
            column: {
                getColDef: jest.fn(() => ({colTag: 'cusip'}))
            }
        };
        const callback = {
            setShowPriceChart: (_priceChartInputs: PriceChartInputs) => {}
        };
        jest.spyOn(callback, 'setShowPriceChart');
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params, 'setShowPriceChart');
        service.launchSpritelet(widget, spriteletEvent, callback.setShowPriceChart);
        const cusipColumn = (widget.dataStore.metaData.inputs.get('columns') as ColumnSet).columns.find(
            (col) => col.columnTag === 'cusip'
        );
        expect(cusipColumn.columnKey).toBe('cusip_0');
        const priceChartInputs = new PriceChartInputs('cusip', 'Label');
        expect(callback.setShowPriceChart).toHaveBeenCalledWith(priceChartInputs);
    });
});
