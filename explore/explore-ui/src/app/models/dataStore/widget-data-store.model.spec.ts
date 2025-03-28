import {WidgetDataStoreMetaData} from './widget-data-store-meta-data.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetDataStore} from './widget-data-store.model';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FilterExcludeKey, FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';

/**
 * Test cases for WidgetDataStore model
 */
describe('WidgetDataStore', () => {

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Test copy
     */
    it('copy works as expected', (() => {
        let dataStore1 = getWidgetDataStore();
        const dataStore2 = new WidgetDataStore();
        dataStore2.copy(dataStore1);
        expect(dataStore1.equals(dataStore2)).toBeTruthy();
        expect(dataStore1.isDependentOnParentForData).toBeTruthy();
        expect(dataStore1.isDependentOnParentForMetaData).toBeTruthy();
        dataStore1 = getWidgetDataStoreWithCustomVizConfig();
        dataStore2.copy(dataStore1);
        expect(dataStore1.equals(dataStore2)).toBeTruthy();
        expect(dataStore1.isDependentOnParentForData).toBeFalsy();
        expect(dataStore1.isDependentOnParentForMetaData).toBeFalsy();
    }));

    /**
     * Test copy with parent meta data
     */
    it('copy works as expected with parent data store', (() => {
        const dataStore1 = getWidgetDataStoreWithParentDataStore();
        dataStore1.isDependentOnParentForData = true;
        dataStore1.parentDataStore.data = {widgetConfigType : WidgetConfigType.RETURNS};
        const dataStore2 = new WidgetDataStore();
        dataStore2.copy(dataStore1);
        expect(dataStore1.equals(dataStore2)).toBeTruthy();
        expect(dataStore2.parentDataStore).toBeDefined();
        expect(dataStore1.parentDataStore.equals(dataStore2.parentDataStore)).toBeTruthy();
        expect(dataStore2.parentDataStore.data.widgetConfigType).toBe(WidgetConfigType.RETURNS);
    }));

    /**
     * Test serialize/deserialize
     */
    it('serialize/deserialize of data store works as expected', (() => {
        let dataStore1 = getWidgetDataStore();

        let serializedData: any = dataStore1.serialize(false);

        const dataStore2 = new WidgetDataStore();
        dataStore2.deserialize(serializedData);
        expect(dataStore1.equals(dataStore2)).toBeTruthy();

        const colSet = <ColumnSet>dataStore2.metaData.inputs.get('columns');

        expect(colSet.columns.length).toBe(3);
        expect(colSet.columns[0].columnTag).toBe('security_description');
        expect(colSet.columns[1].columnTag).toBe('cusip');
        expect(colSet.columns[2].columnTag).toBe('pct_mv');
        expect(dataStore2.isDependentOnParentForData).toBeTruthy();
        expect(dataStore2.isDependentOnParentForMetaData).toBeTruthy();

        dataStore1 = getWidgetDataStoreWithCustomVizConfig();
        serializedData = dataStore1.serialize(false);
        serializedData.data = {
            'customVizConfig': {
                'breadcrumbsMeasures': [{
                    'columnTitle': 'BGO'
                }
                ],
                'queryKeys': [{
                    'field': '_ROOT_',
                    'includes': ['BGO'],
                    'type': 'filterInclude'
                }, {
                    'field': '_ROOT_',
                    'includes': [undefined],
                    'type': 'filterInclude'
                }, {
                    'field': '_ROOT_',
                    'type': 'groupBy'
                }, {
                    'field': '_ROOT_',
                    'type': 'filterExclude'
                }],
                'groupBys': [],
                'leafLevels': ['portfolio']
            }
        };
        dataStore2.deserialize(serializedData);
        expect(dataStore2.data.customVizConfig).toBeTruthy();
    }));

    /**
     * Test serialize/deserialize with parent data store
     */
    it('serialize/deserialize of returns meta data with parent meta data works as expected', (() => {
        const dataStore1 = getWidgetDataStoreWithParentDataStore();

        const serializedData: any = dataStore1.serialize(false);

        const dataStore2 = new WidgetDataStore();
        dataStore2.deserialize(serializedData);
        expect(serializedData.parentDataStore).toBe(dataStore1.parentDataStore.name);
        dataStore2.parentDataStore = dataStore1.parentDataStore;
        expect(dataStore2.equals(dataStore1)).toBeTruthy();

        let colSet = <ColumnSet>dataStore2.metaData.inputs.get('columns');

        expect(colSet.columns.length).toBe(3);
        expect(colSet.columns[0].columnTag).toBe('security_description');
        expect(colSet.columns[1].columnTag).toBe('cusip');
        expect(colSet.columns[2].columnTag).toBe('pct_mv');

        colSet = <ColumnSet>dataStore2.parentDataStore.metaData.inputs.get('columns-parent');

        expect(colSet.columns.length).toBe(2);
        expect(colSet.columns[0].columnTag).toBe('security_description');
        expect(colSet.columns[1].columnTag).toBe('cusip');
    }));

    function getWidgetDataStore(): WidgetDataStore {
        const widgetDataStore = new WidgetDataStore();
        const metaData = new WidgetDataStoreMetaData();
        const cols = [
            {
                'columnTag': 'security_description',
                'positionColumnType': 'ALL',
                'columnKey': 'security_description_1'
            },
            {
                'columnTag': 'cusip',
                'positionColumnType': 'ALL',
                'columnKey': 'cusip_0'
            },
            {
                'columnTag': 'pct_mv',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_mv_1'
            }
        ];
        metaData.inputs.set('columns', new ColumnSet(cols));
        widgetDataStore.metaData = metaData;
        widgetDataStore.isDependentOnParentForData = true;
        widgetDataStore.isDependentOnParentForMetaData = true;
        return widgetDataStore;
    }

    function getWidgetDataStoreWithParentDataStore(): WidgetDataStore {
        const widgetDataStore = getWidgetDataStore();
        const parentDataStore = new WidgetDataStore();
        parentDataStore.metaData = new WidgetDataStoreMetaData();

        const cols = [
            {
                'columnTag': 'security_description',
                'positionColumnType': 'ALL',
                'columnKey': 'security_description_1'
            },
            {
                'columnTag': 'cusip',
                'positionColumnType': 'ALL',
                'columnKey': 'cusip_0'
            }
        ];
        parentDataStore.metaData.inputs.set('columns-parent', new ColumnSet(cols));
        widgetDataStore.parentDataStore = parentDataStore;
        return widgetDataStore;
    }

    function getWidgetDataStoreWithCustomVizConfig(): WidgetDataStore {
        const widgetDataStore = getWidgetDataStore();
        widgetDataStore.name = 'test';
        widgetDataStore.isDependentOnParentForData = false;
        widgetDataStore.isDependentOnParentForMetaData = false;
        widgetDataStore.data = {
            widgetConfigType: WidgetConfigType.PGS_BAR,
            customVizConfig: {
                queryKeys: [new GroupByKey('level-1'), new FilterIncludeKey('level-2', ['PEP']), new FilterExcludeKey('level-3', ['PEP'])],
                breadcrumbsMeasures: ['PEP'],
                leafLevels: ['portfolio'],
                groupBys: ['portfolio']
            }
        };
        return widgetDataStore;
    }
});
