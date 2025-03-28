import {ChartWidgetInputConfigType, WidgetInput} from '@blk/explore-ui-core';
import { SortedColumns } from '../sorted-columns/sorted-columns';

/**
 * Model class for SortedColumnsY
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.SORTED_COLUMNS_Y
 */
export class SortedColumnsY extends SortedColumns implements WidgetInput {
    getConfigType() {
        return ChartWidgetInputConfigType.SORTED_COLUMNS_Y;
    }
}
