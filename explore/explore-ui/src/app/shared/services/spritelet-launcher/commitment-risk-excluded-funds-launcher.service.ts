import {Injectable} from '@angular/core';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {Widget} from '@models/widget/widget.model';
import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {WorkspaceStore} from '../../../stores';

/**
 * Launches ACRM Excluded Funds child spritelet from parent Commitment Risk widget
 */
@Injectable()
export class CommitmentRiskExcludedFundsLauncherService extends AbstractSpriteletLauncherService {

    static readonly ACTION_KEY = 'OPEN_COMMITMENT_RISK_EXCLUDED_FUNDS';

    /**
     * Action key for spritelet
     */
    getSpriteletActionKey(): string {
        return CommitmentRiskExcludedFundsLauncherService.ACTION_KEY;
    }

    /**
     * Creates ACRM excluded funds spritelet from parent commitment risk widget
     * @param widget  Parent Commitment Risk widget
     */
    launchSpritelet(widget: Widget): void {
        const spriteletWidget = new Widget(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS);
        spriteletWidget.showSettings = false;

        // excluded funds spritelet is dependent on parent widget for metadata
        spriteletWidget.dataStore.parentDataStore = widget.dataStore;
        spriteletWidget.dataStore.isDependentOnParentForMetaData = true;

        this.setWidgetInputs(spriteletWidget.dataStore.metaData, widget.dataStore.metaData);

        this.addSpriteletWidgetToReport(widget, spriteletWidget, WorkspaceStore.getCurrentReport());
    }

    /**
     * Copy metadata inputs from parent widget to child spritelet
     */
    private setWidgetInputs(spriteletMetaData: WidgetDataStoreMetaData, parentMetaData: WidgetDataStoreMetaData): void {
        this.copyWidgetInput(WidgetInputType.COMMITMENT_RISK_SCENARIO, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(WidgetInputType.COMMITMENT_RISK_GROUPING, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(WidgetInputType.COMMITMENT_HORIZON, spriteletMetaData, parentMetaData);
    }

}
