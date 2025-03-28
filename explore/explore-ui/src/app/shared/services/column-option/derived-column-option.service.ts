import {Injectable} from '@angular/core';
import {LiquidityStore} from '@blk/explore-ui-column-option';
import {ColumnConfig, CoreDefinitionStore, WidgetInput} from '@blk/explore-ui-core';
import {DefinitionsStore} from '@stores/definitions.store';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnUtils} from '@utils/column.utils';
import {union} from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class DerivedColumnOptionService {
    /**
     * Get option definitions
     */
    getOptionDefinitions(): Map<string, any> {
        return new Map(union(Object.entries(CoreDefinitionStore), Object.entries(DefinitionsStore), Object.entries(LiquidityStore)));
    }

    /**
     * Update column with widget and portfolio settings
     */
    updateColumnWithDerivedSettings(column: ColumnConfig, inputs: Map<string, WidgetInput>, widgetType: string): void {
        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(column, WorkspaceStore.getCurrentPortfolio(), inputs, widgetType);
    }
}
