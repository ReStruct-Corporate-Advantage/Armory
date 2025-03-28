import {Widget} from '@models/widget/widget.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnConstants, UseType, WidgetInputType} from '@blk/explore-ui-core';
import {Breakdown} from '@blk/explore-ui-breakdown';

/**
 * Utils class for active shares spritelet
 */
export class ActiveSharesSpriteletUtils {

    /**
     * update the columns and breakdown for spriteletWidget
     */
    static updateInputsForActiveSharesSpritelet(spriteletWidget: Widget) {
        this.updateColumnsForActiveShares(spriteletWidget);
        this.updateBreakdownForActiveShares(spriteletWidget);
    }

    /**
     * update the columns for spriteletWidget
     */
    static updateColumnsForActiveShares(spriteletWidget: Widget) {
        const columnSet = new ColumnSet();
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.COLUMN_TAG.SEC_DESC, UseType.ALL, ColumnConstants.COLUMN_TAG.SEC_DESC));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.COLUMN_TAG.CUSIP, UseType.ALL, ColumnConstants.COLUMN_TAG.CUSIP));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.PCT_NMV_DEL_ADJ, UseType.PORT, ColumnConfig.generateColumnKey(ColumnConstants.PCT_NMV_DEL_ADJ)));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.PCT_NMV_DEL_ADJ, UseType.BENCH, ColumnConfig.generateColumnKey(ColumnConstants.PCT_NMV_DEL_ADJ)));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.PCT_NMV_DEL_ADJ, UseType.ACTIVE, ColumnConfig.generateColumnKey(ColumnConstants.PCT_NMV_DEL_ADJ)));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.ACTIVE_SHARES, UseType.ALL, ColumnConstants.ACTIVE_SHARES));
        spriteletWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
    }

    /**
     * update the breakdown for spriteletWidget
     */
    static updateBreakdownForActiveShares(spriteletWidget: Widget) {
        const breakdown = new Breakdown();
        const breakdownData = {
            'breakdown': {
                'breakdownTitle': 'Active Shares',
                'subSectors': [
                    {
                        'breakdownRuleType': 'CustomSector',
                        'includeOtherBucket': true,
                        'rule': {
                            'ruleType': 'RuleGroup',
                            'ruleGroup': 'OR',
                            'subRules': [
                                {
                                    'colPositionColumnType': 'ALL',
                                    'colTag': 'sec_group',
                                    'colTitle': 'Security Group',
                                    'colType': 'STRING',
                                    'compType': 'Equals',
                                    'compValues': [
                                        'CASH'
                                    ],
                                    'customSectorType': 'Attributes',
                                    'ruleType': 'Rule',
                                    'includeNullValues': false
                                },
                                {
                                    'colPositionColumnType': 'ALL',
                                    'colTag': 'der_is_cash_equiv',
                                    'colTitle': 'Cash Equivalent',
                                    'colType': 'STRING',
                                    'compType': 'Equals',
                                    'compValues': [
                                        'Y'
                                    ],
                                    'customSectorType': 'Attributes',
                                    'ruleType': 'Rule',
                                    'includeNullValues': false
                                }
                            ]
                        },
                        'title': 'Cash'
                    },
                    {
                        'breakdownRuleType': 'String',
                        'groupByColumn': {
                            'columnName': 'Issuer Name',
                            'columnTag': 'issuer_name',
                            'dataType': 'STRING',
                            'positionColumnType': 'ALL'
                        },
                        'useNoneBuckets': true
                    }
                ]
            },
            'title': 'Active Shares'
        };
        breakdown.deserialize(breakdownData);
        spriteletWidget.dataStore.metaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);
    }
}
