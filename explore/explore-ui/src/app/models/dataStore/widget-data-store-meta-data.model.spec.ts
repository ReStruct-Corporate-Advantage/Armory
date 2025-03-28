import {WidgetDataStoreMetaData} from './widget-data-store-meta-data.model';
import {TestUtils} from '@utils/test.utils';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {AxisSettings} from '@models/widget/inputs/chart-settings/axis-settings.model';

/**
 * Test cases for WidgetDataStoreMetaData model
 */
describe('WidgetDataStoreMetaData', () => {

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Test copy
     */
    it('copy works as expected', (() => {
        const metadata1 = getMetaData();
        const metadata2 = new WidgetDataStoreMetaData();
        metadata2.copy(metadata1);
        expect(metadata1.equals(metadata2)).toBeTruthy();
    }));

    /**
     * Test copy with parent meta data
     */
    it('copy works as expected with parent meta data', (() => {
        const metadata1 = getMetaDataWithParentMetaData();
        const metadata2 = new WidgetDataStoreMetaData();
        metadata2.copy(metadata1);
        expect(metadata1.equals(metadata2)).toBeTruthy();
        expect(metadata2.parentMetaData).toBeDefined();
        expect(metadata1.parentMetaData.equals(metadata2.parentMetaData)).toBeTruthy();
    }));

    /**
     * Test serialize/deserialize
     */
    it('serialize/deserialize of meta data works as expected', (() => {
        const metadata1 = getMetaData();

        const serializedData: any = metadata1.serialize(false);

        const metadata2 = new WidgetDataStoreMetaData();
        metadata2.deserialize(serializedData);
        expect(metadata1.equals(metadata2)).toBeTruthy();

        const colSet = <ColumnSet>metadata2.inputs.get('columns');

        expect(colSet.columns.length).toBe(3);
        expect(colSet.columns[0].columnTag).toBe('security_description');
        expect(colSet.columns[1].columnTag).toBe('cusip');
        expect(colSet.columns[2].columnTag).toBe('pct_mv');
    }));

    /**
     * Test serialize/deserialize with parent meta data
     */
    it('serialize/deserialize of returns meta data with parent meta data works as expected', () => {
        const metadata1 = getMetaDataWithParentMetaData();

        const serializedData: any = metadata1.serialize(false);

        const metadata2 = new WidgetDataStoreMetaData();
        metadata2.deserialize(serializedData);
        metadata2.parentMetaData = metadata1.parentMetaData;
        expect(metadata1.equals(metadata2)).toBeTruthy();

        let colSet = <ColumnSet>metadata2.inputs.get('columns');

        expect(colSet.columns.length).toBe(3);
        expect(colSet.columns[0].columnTag).toBe('security_description');
        expect(colSet.columns[1].columnTag).toBe('cusip');
        expect(colSet.columns[2].columnTag).toBe('pct_mv');

        colSet = <ColumnSet>metadata2.parentMetaData.inputs.get('columns-parent');

        expect(colSet.columns.length).toBe(2);
        expect(colSet.columns[0].columnTag).toBe('security_description');
        expect(colSet.columns[1].columnTag).toBe('cusip');
    });

    it('should handle legacy widgetInput during deserialize',  () => {
        const serializedData = {
            inputs: {
                overrideAxisTitle: {primaryAxisTitle: 'axis1', secondaryAxisTitle: 'axis2'}
            }
        };

        const widgetDataStoreMetaData = new WidgetDataStoreMetaData();
        widgetDataStoreMetaData.deserialize(serializedData);

        expect(widgetDataStoreMetaData.inputs.get('primaryAxisSettings') instanceof AxisSettings).toBeTruthy();
        expect((widgetDataStoreMetaData.inputs.get('primaryAxisSettings') as AxisSettings).axisTitle).toEqual('axis1');
        expect(widgetDataStoreMetaData.inputs.get('secondaryAxisSettings') instanceof AxisSettings).toBeTruthy();
        expect((widgetDataStoreMetaData.inputs.get('secondaryAxisSettings') as AxisSettings).axisTitle).toEqual('axis2');

        const serializedData2 = {
            inputs: {
                overrideAxisTitle: {overrideAxisTitle: {primaryAxisTitle: 'axisA', secondaryAxisTitle: 'axisB'}}
            }
        };

        widgetDataStoreMetaData.deserialize(serializedData2);

        expect(widgetDataStoreMetaData.inputs.get('primaryAxisSettings') instanceof AxisSettings).toBeTruthy();
        expect((widgetDataStoreMetaData.inputs.get('primaryAxisSettings') as AxisSettings).axisTitle).toEqual('axisA');
        expect(widgetDataStoreMetaData.inputs.get('secondaryAxisSettings') instanceof AxisSettings).toBeTruthy();
        expect((widgetDataStoreMetaData.inputs.get('secondaryAxisSettings') as AxisSettings).axisTitle).toEqual('axisB');

    });


    function getMetaData() {
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
        return metaData;
    }

    function getMetaDataWithParentMetaData() {
        const metaData = getMetaData();
        metaData.parentMetaData = new WidgetDataStoreMetaData();

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
        metaData.parentMetaData.inputs.set('columns-parent', new ColumnSet(cols));
        return metaData;
    }



});
