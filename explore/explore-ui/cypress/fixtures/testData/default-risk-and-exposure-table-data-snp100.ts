/**
 * Mock Risk and Exposure data for portfolio "SNP100" with date "20230202"
 */

// Expected table header for default Risk and Exposure widget
export const expectedTableHeaders = [
    ['Security Description', 'CUSIP', 'Market Value %']
];

// Expected collapsed table data for default Risk and Exposure widget
export const expectedCollapsedTableData = [
    ['SNP100', '', '100.0%'],
    ['CASH', '', '0.0%'],
    ['EQUITY', '', '100.0%']
];

// Expected table data for default Risk and Exposure widget with Collapse All Levels
export const expectedCollapsedAllTableData = [
    ['SNP100', '', '100.0%'],
];

// Expected table data for default Risk and Exposure widget with CASH expanded
export const expectedTableDataCashExpanded = [
    ['SNP100', '', '100.0%'],
    ['CASH', '', '0.0%'],
    ['EQUITY', '', '100.0%'],
    ['USD CASH(Committed)', 'USD_CCASH', '0.0%']
];

// Expected table data for default Risk and Exposure widget with Expand All Levels
//  This is what cypress can see from the dom on fully expanded widget.
export const expectedExpandAllTableData = [
    ['SNP100', '', '100.0%'],
    ['CASH', '', '0.0%'],
    ['USD CASH(Committed)', 'USD_CCASH', '0.0%'],
    ['EQUITY', '', '100.0%'],
    ['3M', '88579Y101', '0.3%'],
    ['ABBOTT LABORATORIES', '002824100', '0.9%'],
    ['ABBVIE INC', '00287Y109', '1.1%'],
    ['ACCENTURE PLC CLASS A', 'G1151C101', '0.8%'],
    ['ADOBE INC', '00724F101', '0.8%'],
    ['ADVANCED MICRO DEVICES INC', '007903107', '0.6%'],
    ['ALPHABET INC CLASS A', '02079K305', '2.8%'],
    ['ALPHABET INC CLASS C', 'SBYY88Y78', '2.5%'],
    ['ALTRIA GROUP INC', '02209S103', '0.4%'],
    ['AMAZON COM INC', '023135106', '4.4%']
];

