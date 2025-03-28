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
export class PgsMCvarPnlTimeseriesTableSpritletLauncherService extends PgsPnlTimeseriesTableSpritletLauncherService {

    readonly mandatoryColumnTags = ['mcvar_sim_pnl_path'];

    protected getChildConfigType(): WidgetConfigType {
        return WidgetConfigType.MCVAR_PNL_TS;
    }

    getSpriteletActionKey(): string {
        return WidgetConstants.MCVAR_SIMULATION_PNLS.ACTION_KEY;
    }

    isMandatoryColumn(column: ColumnConfig): boolean {
        return this.mandatoryColumnTags.includes(column.columnTag);
    }
}
