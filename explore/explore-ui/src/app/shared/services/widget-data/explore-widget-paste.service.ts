import {
    CoreFavoriteUtils, ErrorTypeConstants,
    TelemetryActionConstants,
    TelemetryReportActionParameters,
    TelemetryService, UIErrorParameters,
    WidgetCopyPasteEnum, WidgetInputType
} from '@blk/explore-ui-core';
import {isObject} from 'lodash';
import {AppUtils} from '@utils/app.utils';
import {forkJoin, Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {NotificationService} from '@services/notification';
import {FavoriteService} from '@services/favorite';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {Widget} from '@models/widget/widget.model';
import {WidgetUtils} from '@utils/widget.utils';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ChartUtils} from '@utils/chart.utils';

/**
 * Service to cache data into the browser storage
 */

@Injectable({
    providedIn: 'root'
})
export class ExploreWidgetPasteService {

    pasteCompleteSubject = new Subject<void>();

    /**
     * constructor
     */
    constructor(private notificationService: NotificationService, private favoritesService: FavoriteService) {
    }

    pasteComplete() {
        this.pasteCompleteSubject.next();
    }

    getPasteCompleteObs(): Observable<void> {
        return this.pasteCompleteSubject.asObservable();
    }

    /**
     * creates a new widget in report from clipboardData
     */
    async pasteWidget(clipboardDataFromEvent: any, report: Report) {
        let clipboardData: any;
        try {
            clipboardData = JSON.parse(clipboardDataFromEvent);
        } catch (e) {
            // Show a message indicating that the widget was pasted.
            this.notificationService.error('Invalid contents in clipboard. Please copy widget.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PASTE_WIDGET_ERROR);
            this.trackWidgetPastedViaTelemetry(WidgetCopyPasteEnum.PASTE_ERROR_INVALID_CONTENTS_IN_CLIPBOARD, WorkspaceStore.getCurrentReport());
            return;
        }

        let widgetConfigObject: any;
        let dataStoreObject: any;

        // check if the widget is pasted to a different environment, e.g. from prod to dev
        if (AppUtils.getHref() === clipboardData.href) {
            widgetConfigObject = clipboardData.nestedWidgetConfig;
            dataStoreObject = clipboardData.nestedDataStore;

            // Find any nested favorites and load them if they are not already there.
            await this.loadNestedFavorites(widgetConfigObject, dataStoreObject);
        } else {
            widgetConfigObject = clipboardData.nonNestedWidgetConfig;
            dataStoreObject = clipboardData.nonNestedDataStore ? clipboardData.nonNestedDataStore : clipboardData.dataStore;
        }

        const isThisSameReport: boolean = clipboardData.reportKey === WorkspaceStore.getCurrentReport().key;
        const isThereParentDataStore: boolean = dataStoreObject && dataStoreObject.parentDataStore;
        const portfolioOverrideInput = dataStoreObject.metaData.inputs[WidgetInputType.PORTFOLIO_OVERRIDE_INPUT];
        const isPortfolioOverrideInput: boolean = portfolioOverrideInput && portfolioOverrideInput.portfolio && !WorkspaceStore.getCurrentPortfolio().equals(portfolioOverrideInput.portfolio);
        // check if the widget is pasted to a different report and has a parentDataStore
        if (!isThisSameReport && (isThereParentDataStore || ChartUtils.isPGSSpritletWidget(widgetConfigObject.configType) || isPortfolioOverrideInput)) {
            this.notificationService.error('Cannot copy dependent widgets across different reports.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PASTE_WIDGET_ERROR);
            this.trackWidgetPastedViaTelemetry(WidgetCopyPasteEnum.PASTE_ERROR_CANNOT_COPY_DEPENDENT_WIDGETS_ACROSS_DIFFERENT_REPORT,
                WorkspaceStore.getCurrentReport(), widgetConfigObject.configType.toString());
            return;
        }

        // when create the pasted widget, remove the copied widget id from it
        widgetConfigObject.id = null;

        let newDataStore;
        if (dataStoreObject) {
            // Create the new datastore for this widget.  Also need to set a new name on it so we do not replace any existing data stores.
            newDataStore = new WidgetDataStore(dataStoreObject);
            newDataStore.generateName();
            if (dataStoreObject.parentDataStore) {
                const parentDs = report.availableDataStores.get(dataStoreObject.parentDataStore);
                if (parentDs) {
                    newDataStore.parentDataStore = parentDs;
                }
            }
        }
        const widget: Widget = new Widget(widgetConfigObject.configType, widgetConfigObject, newDataStore);
        // Update widget with portfolio setting in case of pasting a widget or for favs
        const portfolio = WorkspaceStore.getCurrentPortfolio();
        WidgetUtils.updateWidgetWithPortfolioSettings(widget, portfolio);

        report.availableDataStores.set(widget.dataStore.name, widget.dataStore);

        // allow gridster to auto-position widget in report (either where there's space or at bottom)
        delete widget.dimensions.x;
        delete widget.dimensions.y;

        report.addWidget(widget);

        // Show a message on the toast indicating that the widget was pasted.
        this.notificationService.success('Widget pasted.');
        this.trackWidgetPastedViaTelemetry(WidgetCopyPasteEnum.WIDGET_PASTED, report, widget);
    }

    /**
     * This function goes through the widget and data store config and loads any of the nested favorites that are found.
     * NOTE:  The parameters are intentionally "any" as they are the raw favorite data.
     */
    private async loadNestedFavorites(widgetConfigObject: any, dataStoreObject: any) {
        const favoriteObjects: any[] = [
            ...this.getFavoriteObjects(widgetConfigObject),
            ...this.getFavoriteObjects(dataStoreObject)
        ];

        // If there are no items then just get out of here.
        if (favoriteObjects.length === 0) {
            return;
        }

        // Get the unique list of favorites in the array.
        const favItems = new Set(favoriteObjects.map(item => CoreFavoriteUtils.getFavoriteKey(item.isGlobalFav, item.favId)));

        // Load the favorite for each of the items.
        // Note:  This will use the cache inside the favorite service if it is already there.
        const observeList = Array.from(favItems).map(fav => {
            return this.favoritesService.getFavorite$(fav.id, null, fav.global, false);
        });

        await forkJoin(observeList).toPromise();
    }

    /**
     * Find all the favorite items within this object.
     */
    private getFavoriteObjects(searchObject: any): any[] {
        // If it is not an object then just get out of here.
        if (!isObject(searchObject)) {
            return [];
        }

        const favObjects: any[] = [];
        Object.keys(searchObject).forEach((key: string) => {
            // Skip if not a property of this object directly.
            if (!searchObject.hasOwnProperty(key)) {
                return;
            }

            const childObj = searchObject[key];
            if (childObj == null) {
                // Do nothing.
            } else if (childObj.favId) {
                favObjects.push(childObj);
            } else {
                // Recurse and see if there are any child elements that have it.
                favObjects.push(...this.getFavoriteObjects(childObj));
            }
        });

        return favObjects;
    }

    private trackWidgetPastedViaTelemetry(actionType: string,  currentReport: Report, widget?: Widget | string) {
        let widgetConfigType;
        if (widget) {
            if (widget instanceof Widget) {
                widgetConfigType = Array.of(widget.configType.toString());
            } else {
                widgetConfigType = Array.of(widget);
            }
        }
        const reportUserActionParameters = new TelemetryReportActionParameters({actionType, widgetTypes: widgetConfigType,
            reportTitle: currentReport.title, reportId: currentReport.id, reportOwner: currentReport.owner, isWhatIfPortfolio: WorkspaceStore.getCurrentPortfolio() instanceof WhatIfPortfolio});
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_COPY_PASTE, reportUserActionParameters);
    }
}
