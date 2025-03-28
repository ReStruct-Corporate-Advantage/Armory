import {WidgetDataStoreMetaData} from './widget-data-store-meta-data.model';
import {cloneDeep, isNil} from 'lodash';
import {BehaviorSubject, Observable} from 'rxjs';
import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {AppUtils} from '@utils/app.utils';
import {v4 as uuid} from 'uuid';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ChartUtils} from '@utils/chart.utils';
import {FilterExcludeKey, FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';
import {FILTER_EXCLUDE, FILTER_INCLUDE, GROUP_BY} from '@utils/qbstr';

/**
 * Model class for widget data stores
 */
export class WidgetDataStore extends AbstractConfig {
    /**
     * meta data containing inputs that are needed for request creation wrapped up in a Subject
     */
    private _metaData: BehaviorSubject<WidgetDataStoreMetaData> = new BehaviorSubject<WidgetDataStoreMetaData>(new WidgetDataStoreMetaData());

    /**
     * Widget data wrapped up in a subject
     */
    private _data: BehaviorSubject<WidgetPayload> = new BehaviorSubject<WidgetPayload>(undefined);

    /**
     * parent data store
     */
    private _parentDataStore: WidgetDataStore;

    /**
     * Flag indicating that this data store is dependent on parent data store for data
     */
    isDependentOnParentForData: boolean;

    /**
     * Flag indicating that this data store is dependent on parent data store for meta data
     */
    isDependentOnParentForMetaData: boolean;

    /***
     * Unique name identifying a data store
     */
    name: string;


    /**
     * constructor
     */
    constructor(data?: any) {
        super();
        this.generateName();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Get parentDataStore
     */
    get parentDataStore(): WidgetDataStore {
        return this._parentDataStore;
    }

    /**
     * Set parentDataStore
     */
    set parentDataStore(value: WidgetDataStore) {
        this._parentDataStore = value;
        if (value) {
            this._metaData.getValue().parentMetaData = value.metaData;
        }
    }

    /**
     * Get metaData
     */
    get metaData(): WidgetDataStoreMetaData {
        return this._metaData.getValue();
    }

    /**
     * Set metaData
     */
    set metaData(value: WidgetDataStoreMetaData) {
        this._metaData.next(value);
    }

    /**
     * Get meta data as observable
     */
    getMetaData$(): Observable<WidgetDataStoreMetaData> {
        return this._metaData.asObservable();
    }

    /**
     * Set data
     */
    set data(value: WidgetPayload) {
        this._data.next(value);
    }

    /**
     * Get data
     */
    get data(): WidgetPayload {
        return this._data.getValue();
    }

    /**
     * Get the data as observable
     */
    getData$(): Observable<WidgetPayload> {
        if (this.isDependentOnParentForData) {
            return this.parentDataStore.getData$();
        }
        return this._data.asObservable();
    }


    /**
     * Copy Method
     */
    copy(store: WidgetDataStore): void {
        this.name = cloneDeep(store.name);
        this.metaData.copy(store.metaData);
        this.isDependentOnParentForMetaData = store.isDependentOnParentForMetaData;
        this.isDependentOnParentForData = store.isDependentOnParentForData;
        if (store.parentDataStore) {
            this.parentDataStore = new WidgetDataStore();
            this.parentDataStore.copy(store.parentDataStore);
            if (this.isDependentOnParentForData) {
                this.parentDataStore.data = store.parentDataStore.data;
            }
        }
        if (ChartUtils.isPGSGraphingSpritelet(store.data?.widgetConfigType)) {
            this.data = {customVizConfig: store.data.customVizConfig};
        }
    }

    /**
     * Deserialize saved dataStore
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        if (data.name) {
            this.name = data.name;
        }
        this.isDependentOnParentForMetaData = data.isDependentOnParentForMetaData;
        this.isDependentOnParentForData = data.isDependentOnParentForData;
        this.metaData = new WidgetDataStoreMetaData(data.metaData);
        if (!isNil(data.data?.customVizConfig)) {
            // for legacy favorites which saved customVizConfig
            this.setCustomVizConfigSettings(data.data.customVizConfig);
        }
    }

    /**
     * Serialize DataStore for saving
     */
    serialize(isNested?: boolean | SerializeFavoriteType, shouldSaveLinkedFav?: (config: AbstractConfig) => boolean): any {
        const dataToSave: any = {};
        if (this.name) {
            dataToSave.name = this.name;
        }
        if (this.parentDataStore) {
            dataToSave.parentDataStore = this.parentDataStore.name;
        }
        if (this.isDependentOnParentForData) {
            dataToSave.isDependentOnParentForData = this.isDependentOnParentForData;
        }
        if (this.isDependentOnParentForMetaData) {
            dataToSave.isDependentOnParentForMetaData = this.isDependentOnParentForMetaData;
        }
        dataToSave.metaData = this.metaData.serialize(isNested, shouldSaveLinkedFav);
        return dataToSave;
    }

    /**
     * Compares two dataStores for equality
     */
    equals(dataStore: WidgetDataStore): boolean {
        if (this.name !== dataStore.name) {
            return false;
        }
        // Compare widget inputs and other attributes
        return this.isDependentOnParentForMetaData === dataStore.isDependentOnParentForMetaData && this.isDependentOnParentForData === dataStore.isDependentOnParentForData && this.metaData.equals(dataStore.metaData);
    }

    /**
     * Generates a new name for this data store.
     */
    generateName(): void {
        this.name = uuid();
    }

    /**
     * Sets customVizConfig settings if saved
     * Only for legacy favorites which saved customVizConfig
     * @param customVizConfig
     * @private
     */
    private setCustomVizConfigSettings(customVizConfig: any): void {
        const queryKeys = customVizConfig?.queryKeys.map(qk => {
            if (qk.type === FILTER_INCLUDE) {
                return new FilterIncludeKey(qk.field, qk.includes.map(key => {
                    return isNil(key) ? undefined : key;
                }));
            } else if (qk.type === GROUP_BY) {
                return new GroupByKey(qk.field);
            } else if (qk.type === FILTER_EXCLUDE) {
                return new FilterExcludeKey(qk.field);
            }
        });
        this.data = {
            responseConfig: {},
            customVizConfig: {
                ...customVizConfig,
                queryKeys
            }
        };
    }
}
