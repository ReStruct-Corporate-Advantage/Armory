import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {Widget} from '@models/widget/widget.model';
import {WidgetConstants} from '@constants/widget.constants';
import {ColumnDefinitionSpriteletLauncherService} from '@services/spritelet-launcher/column-definition-spritelet-launcher.service';
import {CommonConstants} from '@constants/common.constants';
import {isNil} from 'lodash';
import {ColumnConfig, WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';

/**
 * Test cases for ColumnDefinitionSpriteletLauncherService
 */
describe('ColumnDefinitionSpriteletLauncherService', () => {
    let service: ColumnDefinitionSpriteletLauncherService;
    beforeAll(() => {
        TestBed.configureTestingModule({
        });
        service = TestBed.inject(ColumnDefinitionSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(CommonConstants.COLUMN_DEFINITION_SPRITELET.ACTION_KEY);
    });

    it('test launchSpritelet', (done)  => {
        TestUtils.initialize(done);
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const field = {
            field : 'cusip_0'
        };
        const params: any = {
          column: {
              getColDef: () => field
          }
        };

        const callback = {
            setShowColumnDefinitionForColumn: (col: ColumnConfig) => {}
        };
        jest.spyOn(callback, 'setShowColumnDefinitionForColumn');
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params, 'setShowColumnDefinitionForColumn');
        service.launchSpritelet(widget, spriteletEvent, callback.setShowColumnDefinitionForColumn);
        const cusipColumn = (widget.dataStore.metaData.inputs.get('columns') as ColumnSet).columns.find(col => col.columnKey === 'cusip_0');
        expect(callback.setShowColumnDefinitionForColumn).toHaveBeenCalledWith(cusipColumn);
    });

    it('test launchSpritelet - child column', (done)  => {
        TestUtils.initialize(done);
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const field = {
            field : 'pct_mv_1|Current|ABS'
        };
        const params: any = {
            column: {
                getColDef: () => field
            }
        };

        const callback = {
            setShowColumnDefinitionForColumn: (col: ColumnConfig) => {}
        };
        jest.spyOn(callback, 'setShowColumnDefinitionForColumn');
        const spriteletEvent = new SpriteletEvent(WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY, params, 'setShowColumnDefinitionForColumn');
        service.launchSpritelet(widget, spriteletEvent, callback.setShowColumnDefinitionForColumn);
        const marketValCol = (widget.dataStore.metaData.inputs.get('columns') as ColumnSet).columns.find(col => col.columnKey === 'pct_mv_1');
        marketValCol.columnTitle = 'ABS Market Value %';
        const customColumnTitle = marketValCol.getOptionValueByConfigType(CustomTitleColumnOption.CONFIG_TYPE) as CustomTitleColumnOption;
        if (!isNil(customColumnTitle)) {
            customColumnTitle.customTitle = null;
        }
        expect(callback.setShowColumnDefinitionForColumn).toHaveBeenCalledWith(marketValCol);
    });
});
