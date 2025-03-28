import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {ShowSectorLevelDataOnlyModel} from '@models/widget/inputs/show-sector-level-data-only.model';

/**
 * ShowSectorLevelDataOnlyModel tests
 */
describe('ShowSectorLevelDataOnlyModel test', function () {
    let showSectorLevelDataOnly ;
    beforeAll((function () {
        showSectorLevelDataOnly = new ShowSectorLevelDataOnlyModel();
        ConfigInitializer.registerWidgetInputTypes();
    }));

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', function () {
        showSectorLevelDataOnly = new ShowSectorLevelDataOnlyModel();
        showSectorLevelDataOnly.isSectorView = true;

        // convert the object to string and then back to json again.
        const serializedData: any = showSectorLevelDataOnly.serialize();
        const newModel: ShowSectorLevelDataOnlyModel = ConfigTypeFactory.createConfig(serializedData, ShowSectorLevelDataOnlyModel.configType, false);

        // validate that the before and after are the same.
        expect(showSectorLevelDataOnly.isSectorView).toBe(newModel.isSectorView);
    });

    /**
     * Test case for method equals
     */
    it('Test equals', function () {
        const setting1 = new ShowSectorLevelDataOnlyModel();
        setting1.isSectorView = true;

        const setting2 = new ShowSectorLevelDataOnlyModel();
        expect(setting1.equals(setting2)).toBeFalsy();

        const setting3 = new ShowSectorLevelDataOnlyModel();
        setting3.isSectorView = false;
        expect(setting1.equals(setting3)).toBeFalsy();

        setting3.isSectorView = true;
        expect(setting1.equals(setting3)).toBeTruthy();
    });

    it('Test requestParams', () => {
        const requestParams: any = {};
        showSectorLevelDataOnly.isSectorView = true;

        showSectorLevelDataOnly.addRequestParams(requestParams);

        expect(requestParams.isSectorView).toBe('Y');
    });

    it('Test shouldSkipSerialize', () => {
        showSectorLevelDataOnly.isSectorView = true;
        expect(showSectorLevelDataOnly.shouldSkipSerialize()).toBeFalsy();

        showSectorLevelDataOnly.isSectorView = false;
        expect(showSectorLevelDataOnly.shouldSkipSerialize()).toBeTruthy();
    });
});

