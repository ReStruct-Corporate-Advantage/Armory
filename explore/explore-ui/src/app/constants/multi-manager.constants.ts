import {WidgetConfigType} from '@blk/explore-ui-core';

export class MultiManagerConstants {

    static readonly WIDGET_TYPE_TO_TOKEN_VAL_MAP: Map<string, string> = new Map<string, string>([
        [WidgetConfigType.RISK_EXPOSURE, 'RNE'],
        [WidgetConfigType.PGS, 'PGS'],
        [WidgetConfigType.PRA, 'FBA']
    ]);

    static readonly PORTFOLIO_TREE = 'portfolio_tree';
}
