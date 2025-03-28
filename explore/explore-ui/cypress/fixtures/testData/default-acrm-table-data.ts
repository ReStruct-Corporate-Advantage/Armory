/**
 * Mock ACRM table data for portfolio "SPE7US-C" with date "20220819"
 */

// Expected table header for base acrm table
export const expectedBaseTableHeaderCells = [
    ['', '', 'Projected NAV (mm)', 'Projected J-Curve (mm)'],
    ['Description', 'CUSIP', '1 Year (mm)', '3 Year (mm)', '5 Year (mm)', '1 Year (mm)', '3 Year (mm)', '5 Year (mm)']
];

// Expected table data for base acrm table
export const expectedBaseTableData = [
    ['SPE7US-C', '', '', '', '', '', '', ''],
    ['Mean', '', '4', '3', '2', '0', '2', '4'],
    ['10th Percentile', '', '2', '0', '0', '-1', '0', '1'],
    ['25th Percentile', '', '3', '1', '0', '-1', '1', '2'],
    ['50th Percentile', '', '4', '2', '1', '0', '2', '3'],
    ['75th Percentile', '', '5', '4', '2', '0', '3', '4'],
    ['90th Percentile', '', '6', '6', '4', '1', '4', '7']
];

// Expected table header for base vs scenario acrm table
export const expectedBaseVsScenarioTableHeaderCells = [
    ['', '', 'Projected NAV (mm)', 'Projected J-Curve (mm)'],
    ['', '', '1 Year', '3 Year', '5 Year', '1 Year', '3 Year'],
    ['Description', 'CUSIP', 'Base (mm)', 'Stock Market Crash (mm)', 'Base (mm)', 'Stock Market Crash (mm)', 'Base (mm)', 'Stock Market Crash (mm)', 'Base (mm)', 'Stock Market Crash (mm)', 'Base (mm)']
];

export const expectedBaseVsScenarioTableData = [
    ['SPE7US-C', '', '', '', '', '', '', '', '', ''],
    ['Mean', '', '4', '1', '3', '1', '2', '1', '0', '-1'],
    ['10th Percentile', '', '2', '1', '0', '0', '0', '0', '-1', '-1'],
    ['25th Percentile', '', '3', '1', '1', '1', '0', '0', '-1', '-1'],
    ['50th Percentile', '', '4', '1', '2', '1', '1', '1', '0', '-1'],
    ['75th Percentile', '', '5', '1', '4', '2', '2', '2', '0', '-1'],
    ['90th Percentile', '', '6', '2', '6', '3', '4', '3', '1', '0']
];
