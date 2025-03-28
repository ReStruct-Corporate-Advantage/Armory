import {ChartWidgetInputConfigType, WidgetInput} from '@blk/explore-ui-core';
import { SortedColumns } from '../sorted-columns/sorted-columns';

/**
 * Model class for SortedColumnsX
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.SORTED_COLUMNS_X
 */
export class SortedColumnsX extends SortedColumns implements WidgetInput {
    getConfigType() {
        return ChartWidgetInputConfigType.SORTED_COLUMNS_X;
    }
}
