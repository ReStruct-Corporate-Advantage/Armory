import { Injectable } from '@angular/core';
import { AbstractSpriteletLauncherService } from '@services/spritelet-launcher/abstract-spritelet-launcher.service';

import type {Widget} from '@models/widget/widget.model';
import type {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import type {GetContextMenuItemsParams} from 'ag-grid-community';
import {PriceChartInputs} from '@models/price-chart-inputs/price-chart-inputs.model';
import {ColumnConfig, ColumnConstants, CoreDefinitionStore} from '@blk/explore-ui-core';
import type {ColumnSet} from '@blk/explore-ui-column-option';
import { keyBy } from 'lodash';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a price chart popup
 */
export class PriceChartSpriteletLauncherService extends AbstractSpriteletLauncherService {
    /**
     * AbstractSpriteletLauncherService.getSpriteletActionKey
     */
    getSpriteletActionKey(): string {
        return TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_KEY;
    }

    /**
     * AbstractSpriteletLauncherService.launchSpritelet(Widget, SpriteletEvent, Function)
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent, callbackMethod: (PriceChartInputs) => void): void {
        const { columns } = widget.dataStore.metaData.inputs.get(ColumnConstants.COLUMN_HANDLERS.COLUMN) as ColumnSet;
        const visibleColumnTags = columns.map(column => column.columnTag);
        const columnDefinitions = CoreDefinitionStore.columns.filter(column => visibleColumnTags.includes(column.columnTag));
        const columnDefMap = keyBy(columnDefinitions, (column) => column.columnTag);
        const clickedColumnTag = event.params.column.getColDef()['colTag'];

        const isSecurityColumn = columnDefMap[clickedColumnTag]?.groups.includes(ColumnConstants.SECURITY_COLUMN_TYPE)
            || ColumnConstants.SECURITY_DESCRIPTION_COLUMNS.includes(clickedColumnTag);

        const { node } =  event.params as GetContextMenuItemsParams;

        const cusipKey = this.getMatchingKey(columns, ColumnConstants.CUSIP_IDENTIFIER_COLUMNS);
        const titleKey = this.getMatchingKey(columns, [clickedColumnTag, ...ColumnConstants.SECURITY_DESCRIPTION_COLUMNS]);

        const cusip = node.data[cusipKey || ColumnConstants.CUSIP_HIDDEN]
            || node.data[ColumnConstants.PNL_CUSIP_HIDDEN];
        const title = isSecurityColumn ? node.data[titleKey] : cusip;

        const priceChartInputs = new PriceChartInputs(cusip, title);

        callbackMethod(priceChartInputs);
    }

    getMatchingKey(columns: ColumnConfig[], keysToMatch: string[]): string {
        const cusipColumnKey: string = columns.find(({ columnTag }) =>
            keysToMatch.includes(columnTag)
        )?.columnKey;

        return cusipColumnKey;
    }
}
