import {ColumnConfig, ResponseData} from '@blk/explore-ui-core';
import {DateColumnFormatColumnOption, NumericColumnFormatColumnOption} from '@blk/explore-ui-column-option';

/**
 * Class of utility functions for highlight rules tests
 */
export class HighlightRuleTestUtils {

    static getMktValPercent_ColumnConfig(): ColumnConfig {
        const columnConfig = new ColumnConfig();
        columnConfig.columnKey = 'pct_mv_1';
        columnConfig.columnTag = 'pct_mv';
        columnConfig.columnTitle = 'Market Value %';
        columnConfig.title = 'Market Value %';
        columnConfig.positionColumnType = 'PORT';

        const numericColumnFormat = new NumericColumnFormatColumnOption();
        numericColumnFormat.decimalPlaces = 1;
        numericColumnFormat.scaling = 0.01;
        numericColumnFormat.useThousandsSeparator = true;
        columnConfig.optionValues.push(numericColumnFormat);

        return columnConfig;
    }

    static getMktValPercent_DataIndex(): number {
        return 2;
    }

    static getMktValPercent_LeafValues(): number[] {
        return [0.25, 0.15, 0.30, 0.25, 0.05];
    }

    static getCountryName_ColumnConfig(): ColumnConfig {
        const columnConfig = new ColumnConfig();
        columnConfig.columnKey = 'country_d25ea20006724a8';
        columnConfig.columnTag = 'country';
        columnConfig.columnTitle = 'Country Name';
        columnConfig.positionColumnType = 'ALL';

        return columnConfig;
    }

    static getCountryName_DataIndex(): number {
        return 4;
    }

    static getPriceDate_ColumnConfig(): ColumnConfig {
        const columnConfig = new ColumnConfig();
        columnConfig.columnKey = 'price_date_66020533d79a463';
        columnConfig.columnTag = 'price_date';
        columnConfig.columnTitle = 'Price Date';
        columnConfig.positionColumnType = 'PORT';

        const dateColumnFormat = new DateColumnFormatColumnOption();
        dateColumnFormat.label = -1;
        dateColumnFormat.value = 'Aladdin date format';
        columnConfig.optionValues.push(dateColumnFormat);

        return columnConfig;
    }

    static getPriceDate_DataIndex(): number {
        return 3;
    }

    static getMockResponseData(): ResponseData {
        return {
            'data': [
                null,
                null,
                1.00,
                null,
                null
            ],
            'children': [
                {
                    'title': 'CASH',
                    'data': [
                        null,
                        null,
                        0.40,
                        null,
                        null
                    ],
                    'children': [
                        {
                            'data': [
                                'Sec_Desc1',
                                'cusip001',
                                0.25,
                                '10-MAR-2020',
                                'France'
                            ]
                        },
                        {
                            'data': [
                                'Sec_Desc2',
                                'cusip002',
                                0.15,
                                '12-MAR-2020',
                                'Germany'
                            ]
                        }
                    ]
                },
                {
                    'title': 'EQUITY',
                    'data': [
                        null,
                        null,
                        0.60,
                        null,
                        null
                    ],
                    'children': [
                        {
                            'data': [
                                'Sec_Desc3',
                                'cusip003',
                                0.30,
                                '29-FEB-2020',
                                'European Union'
                            ]
                        },
                        {
                            'data': [
                                'Sec_Desc4',
                                'cusip004',
                                0.25,
                                '10-MAR-2020',
                                'European Union'
                            ]
                        },
                        {
                            'data': [
                                'Sec_Desc5',
                                'cusip005',
                                0.05,
                                '20-FEB-2020',
                                'European Union'
                            ]
                        }
                    ]
                }

            ]
        };
    }
}
