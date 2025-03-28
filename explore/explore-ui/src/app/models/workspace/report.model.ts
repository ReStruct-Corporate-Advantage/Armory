import {ChartUtils} from '@utils/chart.utils';
import {each, find, isEmpty, isUndefined} from 'lodash';
import {Widget} from '../widget/widget.model';
import {WidgetDataStore} from '../dataStore/widget-data-store.model';
import {AppUtils} from '@utils/app.utils';
import {
    AbstractFavoriteConfig,
    CommonUtils,
    CoreFavoriteUtils,
    CoreWidgetConfigStore,
    FavoriteDisplayEnum,
    SerializeFavoriteType,
    WidgetConfigType,
    WidgetConfigUtils,
    WidgetInputType,
    WidgetTypeToWidgetConfigTypeMap
} from '@blk/explore-ui-core';
import {ComparisonConfig} from '../config/comparison-config.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {LongRunningHandlerService} from '@services/long-running-operations/long-running-handler.service';
import {WidgetConfigFactory} from '../../factories';

/**
 * Report represents a collection of widgets and their corresponding data stores.. this was previously called as a layout
 */
export class Report extends AbstractFavoriteConfig {
    widgets: Widget[] = [];
    availableDataStores: Map<string, WidgetDataStore> = new Map<string, WidgetDataStore>();
    // comparison config placeholder to accommodate legacy favorites
    comparisonConfigLegacyPlaceholder: ComparisonConfig = new ComparisonConfig();
    // Unique report id
    key: number;
    // Id used in comparison config map
    comparisonConfigId: number;

    constructor(data?: any) {
        super();
        // Assign a report id
        this.key = CommonUtils.generateUniqueIdAsNumber();
        if (typeof data === 'string') {
            // if we create a blank report, we know we don't need to deserialize
            this.title = data;
            this.comparisonConfigId = CommonUtils.generateUniqueIdAsNumber();
        } else if (AppUtils.isObject(data)) {
            // isObject from lodash causing 4d error:
            // 'id' does not exist on type 'object' and 'id' does not exist on type 'object'.
            // Old favorites have id in place of favId so we want to cater for them
            if (data.id && !data.favId) {
                data.favId = data.id;
            }
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'WIDGETS_REPORT';
    }


    /**
     * When deserializing this function may be called to see if the object is supported by this type.
     */
    static supportsObject(object: any): boolean {
        return !isUndefined(object.widgets);
    }

    /**
     */
    getConfigType(): string {
        return Report.configType;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        if (data instanceof Report) {
            this.copyFrom(data);
            return;
        }

        if (!isEmpty(data.widgets) && isUndefined(data.widgets[0].dataStore)) {
            // Handle duplicates for widget ids for old favorites
            this.handleDuplicateIdsForWidgets(data.widgets, data.availableDataStores);
        }

        each(data.widgets, (widget: any, index: number) => {
            // Set configType if not already present
            if (!widget.configType) {
                widget.configType = WidgetTypeToWidgetConfigTypeMap.get(widget.type);
            }
            WidgetConfigFactory.convertLegacyWidgetTypes(widget);
            if (!widget.configType || !CoreWidgetConfigStore.getChartConfigForType(widget.configType)) {
                console.log('Invalid widget found', widget);
                return;
            }

            const dataStore: WidgetDataStore = this.deserializeAndGetWidgetDataStore(data, widget, index);

            const widgetConfig: Widget = new Widget(widget.configType, widget, dataStore);
            if (!dataStore) {
                // If there was no data store present in the serialized data then one would have been created as part of the widget creation
                // So now we need to add that to the report
                this.availableDataStores.set(widgetConfig.dataStore.name, widgetConfig.dataStore);
            }

            this.addWidget(widgetConfig);
            this.attachParentDataStore(data);
        });
        if (data.comparisonConfig) {
            this.comparisonConfigLegacyPlaceholder = new ComparisonConfig(data.comparisonConfig);
        }
        if (data.comparisonConfigId) {
            this.comparisonConfigId = data.comparisonConfigId;
        } else {
            this.comparisonConfigId = CommonUtils.generateUniqueIdAsNumber();
        }
    }

    /**
     * doSerialize
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            configType: Report.configType,
            widgets: [],
            availableDataStores: {}
        };

        (this.widgets || []).forEach((widget: Widget) => {
            data.widgets.push(widget.serialize(isNested));
        });

        this.availableDataStores.forEach((dataStore: WidgetDataStore) => {
            data.availableDataStores[dataStore.name] = dataStore.serialize(isNested);
        });

        data.comparisonConfigId = this.comparisonConfigId;

        if (CoreFavoriteUtils.isFavoriteChangeDetection(isNested)) {
            // removing because it is dynamically generated
            delete data.comparisonConfigId;

            this.normalizeDataStoreNames(data);
        }

        return data;
    }

    /**
     * Replaces the randomly generated dataStore name with the index of its first reference in the widget list
     * If multiple widgets use same dataStore, the dataStore and widgets will still use index of first occurrence
     * @param serializeData  Serialized report data
     */
    private normalizeDataStoreNames(serializeData: any): void {
        // some legacy favorites were created before we had the concept of a dataStore associated with them
        // so each time we deserialize we create a new datastore for it and randomly generate a name
        // here we are renaming the datastore to the index of its first reference in the widget list
        const originalDataStoreName = new Map<string, number>();
        serializeData.widgets.forEach((widget, index) => {
            if (!originalDataStoreName.has(widget.dataStore)) {
                originalDataStoreName.set(widget.dataStore, index);
            }
            widget.dataStore = originalDataStoreName.get(widget.dataStore);
        });
        originalDataStoreName.forEach((nameByIndex, originalName) => {
            // get the data store
            const dataStore = serializeData.availableDataStores[originalName];
            // overwrite name to be the index
            dataStore.name = nameByIndex;
            // update availableDataStores map with new name
            delete serializeData.availableDataStores[originalName];
            serializeData.availableDataStores[nameByIndex] = dataStore;
        });
    }

    deserializeAndGetWidgetDataStore(data: any, widget: any, index: number): WidgetDataStore {
        if (isEmpty(data.availableDataStores)) {
            return null;
        }
        const isOldStyleFavorite = Array.isArray(data.availableDataStores);

        if (isOldStyleFavorite) {
            let dataStore = null;
            each(data['availableDataStores'], (item: any) => {
                // For old favorites
                if (item.observers) {
                    const widgetIndex: number = item.observers.indexOf(widget.id);
                    const hasThisStoreBeenConfigured = find(this.widgets, (reportWidget: Widget) => {
                        return (reportWidget.dataStore && (reportWidget.dataStore.name === item.name));
                    });
                    if (widgetIndex > -1 && !hasThisStoreBeenConfigured) {
                        dataStore = this.availableDataStores.get(item.name);
                        if (!dataStore) {
                            dataStore = new WidgetDataStore(item);
                            this.availableDataStores.set(dataStore.name, dataStore);
                        }
                    }
                }
            });
            if (dataStore) {
                if (ChartUtils.isFactorGraphingSpritelet(widget.configType)) {
                    dataStore.isDependentOnParentForData = true;
                } else if (WidgetConfigUtils.isReturnSpritelet(widget.configType) || widget.configType === WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION) {
                    dataStore.isDependentOnParentForMetaData = true;
                }
            }
            return dataStore;
        }
        Object.keys(data.availableDataStores).forEach((name: string) => {
            // new favorites
            let dataStore = this.availableDataStores.get(name);
            if (!dataStore) {
                dataStore = new WidgetDataStore(data.availableDataStores[name]);
                this.availableDataStores.set(dataStore.name, dataStore);
            }
        });
        // Find out the data store for this widget
        return this.availableDataStores.get(widget.dataStore);
    }

    attachParentDataStore(data: any) {
        // Reestablish parent child relationships and add observers ( Widgets) back in the observers list for the dataStores
        each(data.availableDataStores, (item: any) => {
            if (item.parentDataStore) {
                const parentDs = this.availableDataStores.get(item.parentDataStore);
                const ds = this.availableDataStores.get(item.name);
                if (ds && parentDs) {
                    ds.parentDataStore = parentDs;
                }
            }
        });
    }

    /**
     * Checks if there are any duplicate widget Id's and replaces them
     * with unique ones in the widgets & datastores to be deserialized
     *
     * It also removes any widgets that have no associated datastore but supposed to have
     *
     */
    handleDuplicateIdsForWidgets(serializedWidgets: any[], serializedDatastores: any[]): void {
        // below 2 calls handle return and fba widgets with no datastores and with duplicate Ids
        this.removeWidgetsWithNoDatastoreAndReplaceDuplicateIds(serializedWidgets, serializedDatastores, WidgetConfigType.RETURNS, 'ReturnsDataStore');
        this.removeWidgetsWithNoDatastoreAndReplaceDuplicateIds(serializedWidgets, serializedDatastores, WidgetConfigType.PRA, 'RiskDataStore');

        // collect all the remaining widgets (other than return and fba) with duplicate Ids and replace with unique ones
        const duplicateIdToFreqMap = {};
        serializedWidgets
            .filter(widget => widget.configType !== WidgetConfigType.RETURNS && widget.configType !== WidgetConfigType.PRA)
            .forEach(widget => duplicateIdToFreqMap[widget.id || widget.widgetId] = duplicateIdToFreqMap[widget.id || widget.widgetId] ? ++duplicateIdToFreqMap[widget.id || widget.widgetId] : 1);
        const restOfWidgetWithDuplicateIds = serializedWidgets.filter(widget => duplicateIdToFreqMap[widget.id || widget.widgetId] > 1);
        restOfWidgetWithDuplicateIds.forEach(widget => widget.id ? widget.id = CommonUtils.generateUniqueIdAsString() : widget.widgetId = CommonUtils.generateUniqueIdAsString());
    }

    /**
     * replaces duplicate id's for a widget and it's corresponding parent datastore
     */
    public removeWidgetsWithNoDatastoreAndReplaceDuplicateIds(serializedWidgets: any, serializedDatastores: any[], widgetConfigType: string, dataStoreType: string): void {
        // list of widgets with datastores
        // if there are not widgets of given config type that have no inputs and have the datastores, simply return
        const widgetsWithDatastores: any[] = serializedWidgets.filter(widget => !widget.inputs && widget.configType === widgetConfigType);
        if (isEmpty(widgetsWithDatastores)) {
            return;
        }

        // list of parent datastores for a given datastore type
        const parentDataStores: any[] = serializedDatastores ? serializedDatastores.filter(datastore => (datastore.configType === dataStoreType || datastore.type === dataStoreType) && !datastore.parentDataStore) : [];

        // exhaustive list of all the parent datastore Ids
        const parentDataStoreObserverIdsAtIndexZero: number[] = Array.from(new Set<number>(parentDataStores.map(datastore => this.getParentWidgetId(widgetsWithDatastores.map(widget => widget.id), datastore.observers))));

        // id to widget map for a given config type
        const idToWidgetMap = {};
        parentDataStoreObserverIdsAtIndexZero.forEach(duplicateId => idToWidgetMap[duplicateId] = widgetsWithDatastores.filter(widget => widget.id === duplicateId));

        // id to datastore map for a given datastore type
        const idToParentDatastoresMap = {};
        parentDataStoreObserverIdsAtIndexZero.forEach(duplicateId => idToParentDatastoresMap[duplicateId] = parentDataStores.filter(datastore => datastore.observers.indexOf(duplicateId) !== -1));

        // get all the widgets that have duplicate Ids but no datastores and filter them out from the widget list
        const widgetsToRemove: any[] = widgetsWithDatastores.filter(widget => parentDataStoreObserverIdsAtIndexZero.indexOf(widget.id) === -1);
        widgetsToRemove.forEach(widgetToRemove => serializedWidgets.splice(serializedWidgets.indexOf(widgetToRemove), 1));

        // replace all the duplicate Ids with unique ones for both widgets and corresponding parent datastores
        this.replaceDuplicateIdsWithUniqueOnes(idToWidgetMap, idToParentDatastoresMap, widgetConfigType);
    }

    /**
     * logic to replace duplicate Ids with unique ones for a widget and it's corresponding datastore
     *
     */
    public replaceDuplicateIdsWithUniqueOnes(idToWidgetMap: any, idToParentDatastoresMap: any, widgetConfigType: string): void {
        for (const duplicateId of Object.keys(idToWidgetMap)) {
            const widgetArrLen = idToWidgetMap[duplicateId].length;
            if (widgetArrLen < 2) {
                continue;
            }

            for (let i = 0; i < idToWidgetMap[duplicateId].length; i++) {
                const widget = idToWidgetMap[duplicateId][i];
                const datastore = idToParentDatastoresMap[duplicateId][i];
                widget.id = CommonUtils.generateUniqueIdAsString();
                widget.title = widgetConfigType === WidgetConfigType.RETURNS ? 'Return Analysis' : 'Factor Based Analysis';
                datastore.observers.splice(0, 1, widget.id);
            }
        }
    }

    /**
     * Finds parent widget id out of the observers list
     *
     */
    public getParentWidgetId(dataStoreWidgetIds: number[], parentDataStoreObserverIds: number[]): number {
        return (parentDataStoreObserverIds.filter(observerId => dataStoreWidgetIds.indexOf(observerId) !== -1))[0];
    }


    /**
     * Adds a widget to the report
     * @param widget - widget to be added
     */
    addWidget(widget: Widget): void {
        this.widgets.push(widget);
    }

    /**
     * Callback to delete a widget
     */
    deleteWidget(widget: Widget): void {
        const index = this.widgets.indexOf(widget);
        this.widgets.splice(index, 1);

        // clean up datastores
        // If the deleted widget is the last widget in the report, no need to check whether it has parent or child; remove from dataStore directly
        if (this.widgets.length > 0) {
            this.cleanUpDataStoresForWidgetDeletion(this.widgets, widget);
        } else {
            this.availableDataStores.delete(widget.dataStore.name);
        }

        // Remove any pending long running requests tied to the widget
        this.removeWidgetLongRunningRequests(widget);

        // TODO: If this is the last widget, we can hide the reload required banner
    }

    /**
     * Removes any pending long running requests for all widgets in the report
     */
    removeAllWidgetLongRunningRequests(forPortfolio?: string): void {
        this.widgets?.forEach(widget => this.removeWidgetLongRunningRequests(widget, forPortfolio));
    }

    /**
     * Removes any pending long running requests for a given widget
     */
    removeWidgetLongRunningRequests(widget: Widget, forPortfolio?: string): void {
        if (!LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.has(widget.id)) {
            return;
        }
        const longRunningDetails = LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.get(widget.id);
        const remainingLongRunningDetails = [];
        for (const longRunningDetail of longRunningDetails) {
            // If a port id is passed in, only proceed with removal of a request for a widget for that portfolio
            if (forPortfolio && !longRunningDetail.isRequestForPortfolio(forPortfolio)) {
                // Add other requests to a list as we want to preserve those requests
                remainingLongRunningDetails.push(longRunningDetail);
                continue;
            }
            longRunningDetail.longRunningStatus.next(false);
            LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.delete(longRunningDetail.longRunningId);
        }
        // If a port id is passed in, and we still have remaining requests for this widget id, update the map
        if (forPortfolio && remainingLongRunningDetails.length > 0) {
            LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.set(widget.id, remainingLongRunningDetails);
        } else {
            // Otherwise, just delete the entry for this widget id
            LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.delete(widget.id);
        }
    }

    /**
     * Gets the widgets in the order that they are in the gridster container
     * Prioritize row and then column value
     */
    getWidgetsInOrder(): Widget[] {
        return this.widgets.sort((a: Widget, b: Widget) => {
            if (a.dimensions.y > b.dimensions.y) {
                return 1;
            } else if (a.dimensions.y < b.dimensions.y) {
                return -1;
            } else if (a.dimensions.x > b.dimensions.x) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    /**
     * clean up dataStores by checking if the widget has dependency on the others
     * @param widget
     * Case 1. If the widget is a parent widget, check if there's a remaining widget dependent on it.
     * If yes, only delete the widget, not dataStore; if no, delete both widget and dataStore
     * Case 2. If the widget is a child widget, check whether there's a widget having the same parent as it.
     * If yes, delete the widget and its dataStore; if no, delete the widget, its dataStore and also its parentDataStore.
     */
    private cleanUpDataStoresForWidgetDeletion(remainingWidgets: Widget[], widget: Widget): void {
        // collect all remaining widgets' parentDataStores and dataStores
        const remainingWidgetsParentDataStores: WidgetDataStore[] = remainingWidgets.map(obj => obj.dataStore.parentDataStore);
        const remainingWidgetsDataStores: WidgetDataStore[] = remainingWidgets.map(obj => obj.dataStore);

        const deletedWidgetParentDataStore: WidgetDataStore = widget.dataStore.parentDataStore;

        // check if the deleted widget has a parentDataStore or not
        // Case 1
        if (!deletedWidgetParentDataStore) {
            // if the deleted widget is a parent of any remaining widget, its dataStore should not be deleted
            if (remainingWidgetsParentDataStores.includes(widget.dataStore)) {
                return;
            } else {
                // if it's not the parent of the remaining widget, then we delete its dataStore
                this.availableDataStores.delete(widget.dataStore.name);
            }
        } else {
            // Case 2
            // if the delete widget is a child widget, we delete its dataStore
            this.availableDataStores.delete(widget.dataStore.name);
            // we also check whether its parentDataStore is the same as any remaining widgets' direct dataStores or parentDataStores
            if (!remainingWidgetsDataStores.includes(deletedWidgetParentDataStore) && !remainingWidgetsParentDataStores.includes(deletedWidgetParentDataStore)) {
                // if no, we also delete its parentDataStore
                this.availableDataStores.delete(deletedWidgetParentDataStore.name);
            }
        }
    }

    /**
     * doCopyFrom
     * @param source: AbstractFavoriteConfig
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Report)) {
            return;
        }

        this.widgets = source.widgets;
        this.availableDataStores = source.availableDataStores;
        this.comparisonConfigLegacyPlaceholder = source.comparisonConfigLegacyPlaceholder;
        this.comparisonConfigId = source.comparisonConfigId;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.REPORT;
    }

    /**
     * Clear any flags that were set in order to detect changes to the favorite (ie column option)
     */
    resetChangeDetectionFlags(): void {
        // reset any ColumnSets within the report that are not favorites themselves
        this.widgets.forEach(widget => {
            const columnSet = widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
            if (columnSet && !columnSet.id) {
                columnSet.resetChangeDetectionFlags();
            }
        });
    }
}
