import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {CommonConstants} from '@constants/common.constants';
import {Injectable} from '@angular/core';
import {GetMainMenuItemsParams} from 'ag-grid-community';
import {cloneDeep, isNil} from 'lodash';
import {ColumnSet, CustomTitleColumnOption, LibColumnUtils} from '@blk/explore-ui-column-option';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Column definition popup
 */
export class ColumnDefinitionSpriteletLauncherService extends AbstractSpriteletLauncherService {

    /**
     * AbstractSpriteletLauncherService.getSpriteletActionKey
     */
    getSpriteletActionKey(): string {
        return CommonConstants.COLUMN_DEFINITION_SPRITELET.ACTION_KEY;
    }

    /**
     * AbstractSpriteletLauncherService.launchSpritelet(Widget, SpriteletEvent, Function)
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent, callbackMethod: (ColumnConfig) => void): void {
        let widgetColSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        if (widget.configType === WidgetConfigType.COMMITMENT_RISK) {
            // ACRM widgets use a specific column input
            widgetColSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS) as ColumnSet;
        }
        const colKeyParts = (event.params as GetMainMenuItemsParams).column.getColDef().field.split(CommonConstants.COLUMN_KEY_SPLITTER);
        const parentColKey = colKeyParts[0];
        const column = cloneDeep(widgetColSet.columns.find(col => parentColKey === col.columnKey));
        if (colKeyParts.length > 1) {
            const definition = LibColumnUtils.getColumnDefinition(column);
            column.columnTitle = colKeyParts[colKeyParts.length - 1] + ' ' + definition.title;
            // If we have a child column we don't want to show custom column title
            const customColumnTitle = column.getOptionValueByConfigType(CustomTitleColumnOption.CONFIG_TYPE) as CustomTitleColumnOption;
            if (!isNil(customColumnTitle)) {
                customColumnTitle.customTitle = null;
            }
        }
        callbackMethod(column);
    }
}
