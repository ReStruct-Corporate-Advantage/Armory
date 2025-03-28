import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WorkspaceStore} from '../../../stores';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnUtils} from '@utils/column.utils';

export abstract class AbstractParentDependentSpriteletLauncherService extends AbstractSpriteletLauncherService {

    /**
     * Returns WidgetConfigType of child spritelet
     */
    abstract getChildWidgetConfigType(): WidgetConfigType;

    /**
     * Launches a child chart spritelet that is dependent on parent widget's data store
     *
     * @param widget  Parent widget
     * @param event  Event that triggered the spritelet.  In this case, selection from a grid's column menu
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent): void {
        // create child chart widget with correct widgetConfigInputs
        const childWidget = new Widget(this.getChildWidgetConfigType());

        // spritelet should use parent widget's data
        childWidget.dataStore.parentDataStore = widget.dataStore;
        childWidget.dataStore.isDependentOnParentForData = true;

        // launch the row based if spritelet is launched from 1st column (ag-Grid-AutoColumn)
        if ('node' in event.params && ColumnUtils.checkIfColumnIsRowBasedForSpriteletLaunch(event.params.column.getColId())) {
            // spritelet launched from row
            this.configureRowBasedSpritelet(childWidget, event);
        } else {
            // spritelet launched from column
            this.configureColumnBasedSpritelet(childWidget, event);
        }

        this.configureSpriteletMetadata(childWidget);
        this.addSpriteletWidgetToReport(widget, childWidget, WorkspaceStore.getCurrentReport());
    }

    /**
     * Configures a child chart spritelet launched from a grid column header
     * @param childWidget  Child spritelet widget whose inputs are being modified
     * @param event  Event that triggered the spritelet
     */
    protected configureColumnBasedSpritelet(childWidget: Widget, event: SpriteletEvent) {
        return;
    }

    /**
     * Configures a child chart spritelet launched from a grid row (node)
     * @param childWidget  Child spritelet widget whose inputs are being modified
     * @param event  Event that triggered the spritelet
     */
    protected configureRowBasedSpritelet(childWidget: Widget, event: SpriteletEvent) {
        return;
    }

    /**
     * Configures a child chart spritelet metadata
     * @param childWidget Child spritelet widget whose inputs are being modified
     */
    protected configureSpriteletMetadata(childWidget: Widget) {
        return;
    }
}
