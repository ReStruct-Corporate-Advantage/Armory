import {WorkspaceStore} from '../stores/workspace.store';
import {ConfigInitializer} from './config.initializer';
import {BatchExportingStore} from '../stores/batch-exporting.store';
import {ExploreHighchartsSetup} from '../vizualizations/charts/explore-highcharts.setup';

/**
 * Workspace Initializer to run prerequisites
 */
export class AppInitializer {
    /**
     * initialize
     */
    static initialize() {
        return () => {
            return new Promise<void>(resolve => {
                ConfigInitializer.initializeConfig();
                ExploreHighchartsSetup.initializeHighchartsExtensions();
                WorkspaceStore.init();
                BatchExportingStore.init();
                resolve();
            });
        };
    }
}
