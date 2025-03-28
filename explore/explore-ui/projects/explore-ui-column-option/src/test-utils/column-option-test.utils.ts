import {ColumnConfig, CoreUserMetaDataStore, UserMetaData, ConfigTypeFactory, isWidgetInput, WidgetInput} from '@blk/explore-ui-core';
import * as riskExposureWidgetInputs from '../test-utils/widget-configs/re-widget-inputs.json';

export class ColumnOptionTestUtils {
    static async setUserMetaData(): void {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
    }

    /**
     * Mocks ColumnConfig.createColumn
     * @return a spy on ColumnConfig.createColumn
     */
    static mockColumnCreation(): any {
        const columnConfigSpy = jest.spyOn(ColumnConfig, 'createColumn');
        columnConfigSpy.mockImplementation((columnTag: string) => {
            const columnConfig = new ColumnConfig();
            columnConfig.columnTag = columnTag;
            return columnConfig;
        });

        return columnConfigSpy;
    }

    /**
     * Mocking widget data store meta data deserialize process with json file
     */
    static getWidgetInputMap(): Map<string, WidgetInput> {
        const inputs = new Map<string, WidgetInput>();
        Object.keys(riskExposureWidgetInputs).forEach(key => {
            const value = riskExposureWidgetInputs[key];
            const config = ConfigTypeFactory.createConfig(value, value.configType ? value.configType : key, false);
            if (isWidgetInput(config)) {
                inputs.set(key, config);
            }
        });

        return inputs;
    }
}
