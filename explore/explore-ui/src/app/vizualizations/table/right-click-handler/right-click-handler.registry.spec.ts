import {TestBed} from '@angular/core/testing';
import {WIDGET_RIGHT_CLICK_HANDLER} from '../../../modules/widget/widget.injectable.tokens';
import {RightClickHandlerRegistry} from './right-click-handler.registry';
import {BaseRightClickHandler} from './base-right-click.handler';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('RightClickHandlerRegistry Test', () => {
    let service: RightClickHandlerRegistry;
    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: BaseRightClickHandler,
                    multi: true
                },
                {
                    provide: RightClickHandlerRegistry, useClass: RightClickHandlerRegistry
                }
            ]
        });
        service = TestBed.inject(RightClickHandlerRegistry);
    });

    it('test getService', () => {
        let handler: any = service.getRightClickHandler(WidgetConfigType.PGS);
        expect(handler instanceof BaseRightClickHandler);

        handler = service.getRightClickHandler(WidgetConfigType.EXPOST_TIME_SERIES);
        expect(handler instanceof BaseRightClickHandler);

        handler = service.getRightClickHandler(WidgetConfigType.EXPOST_STATS);
        expect(handler instanceof BaseRightClickHandler);

        handler = service.getRightClickHandler(WidgetConfigType.EXPOST_RETURNS);
        expect(handler instanceof BaseRightClickHandler);

        handler = service.getRightClickHandler(WidgetConfigType.CMBS_MAP);
        expect(handler instanceof BaseRightClickHandler);
    });
});
