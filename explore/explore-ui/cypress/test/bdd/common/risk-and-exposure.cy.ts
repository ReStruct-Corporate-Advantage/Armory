import {Then} from 'cypress-cucumber-preprocessor/steps';
import {gridPage} from '../../../integration/pages/aux-components/grid.page';
import {
    expectedCollapsedAllTableData,
    expectedCollapsedTableData,
    expectedExpandAllTableData,
    expectedTableDataCashExpanded,
    expectedTableHeaders
} from '../../../fixtures/testData/default-risk-and-exposure-table-data-snp100';

Then('Risk and Exposure widget should be displayed with the correct default data', () => {
    gridPage.validateGridData(expectedTableHeaders, expectedCollapsedTableData);
});

Then('Risk and Exposure widget should be displayed with CASH row expanded', () => {
    gridPage.validateGridData(expectedTableHeaders, expectedTableDataCashExpanded);
});

Then('Risk and Exposure widget should be displayed with All rows collapsed', () => {
    gridPage.validateGridData(expectedTableHeaders, expectedCollapsedAllTableData);
});

Then('Risk and Exposure widget should be displayed with All rows expanded', () => {
    gridPage.validateGridData(expectedTableHeaders, expectedExpandAllTableData);
});
