import {Injectable} from '@angular/core';
import {WidgetConstants} from '@constants/widget.constants';
import {
    ColumnConfig,
    WidgetConfigType,
} from '@blk/explore-ui-core';
import {
    PgsPnlTimeseriesTableSpritletLauncherService
} from '@services/spritelet-launcher/pgs-pnl-timeseries-table-spritlet-launcher.service';

@Injectable({
    providedIn: 'root'
})
export class PgsHvarPnlTimeseriesTableSpritletLauncherService extends PgsPnlTimeseriesTableSpritletLauncherService {

    readonly mandatoryColumnTags = ['hvar_sim_sd', 'hvar_sim_ed'];

    protected getChildConfigType(): WidgetConfigType {
        return WidgetConfigType.PNL_TS;
    }

    getSpriteletActionKey(): string {
        return WidgetConstants.HVAR_PNLS_TS.ACTION_KEY;
    }

    isMandatoryColumn(column: ColumnConfig): boolean {
        return this.mandatoryColumnTags.includes(column.columnTag);
    }

}
