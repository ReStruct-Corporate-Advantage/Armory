import type {} from 'cypress';

/**
 * Aux Grid Page
 */
class GridPage {
    private readonly ROW = '.ag-row';
    private readonly CELL = '.ag-cell';
    private readonly NON_ACTION_CELLS_IN_FIRST_CONTAINER = '.ag-cell-wrapper';
    private readonly GROUP_COLLAPSED_ICON = '.ag-icon.ag-icon-tree-closed';
    private readonly ROW_LOADER = '.ag-row-loading';
    private readonly HEADER_CELLS_IN_FIRST_PINNED_CONTAINER = '.ag-header-cell:not([col-id=actionCol]), .ag-header-group-cell:not([col-id=actionCol])';
    private readonly HEADER_CELL = '.ag-header-cell, .ag-header-group-cell';

    private getAuxGrid = (): Cypress.Chainable<JQuery> => cy.get('aux-grid.explore-table');
    private getContextMenu = (): Cypress.Chainable<JQuery> => cy.get('div.ag-menu[aria-label=\'Context Menu\']');
    private getSubMenu = (): Cypress.Chainable<JQuery> => cy.get('div.ag-menu[aria-label=\'SubMenu\']');

    // data rows in left pinned columns
    private getRowsInPinnedLeftContainer = (): Cypress.Chainable<JQuery> => cy.get('.ag-pinned-left-cols-container .ag-row');
    // data rows in unpinned columns
    private getRowsInCenterContainer = (): Cypress.Chainable<JQuery> => cy.get('.ag-center-cols-container .ag-row');
    // header rows in left pinned columns
    private getHeaderRowsInPinnedLeftContainer = (): Cypress.Chainable<JQuery> => cy.get('.ag-pinned-left-header .ag-header-row');
    // header rows in unpinned columns
    private getHeaderRowsInCenterContainer = (): Cypress.Chainable<JQuery> => cy.get('.ag-header-viewport .ag-header-row');

    /**
     * Validate the grid data
     */
    validateGridData(expectedHeaders: string[][], expectedGridData: string[][]): void {
        // Validate the data
        this.getRowsInCenterContainer().should('be.visible');

        this.getAuxGrid().within((auxGrid) => {
            // check if any loader exists in the table
            cy.wrap(auxGrid).get(this.ROW_LOADER).should('not.exist');
            this.fetchAllRowData().then((mergedData) => {
                // Validate the merged data against the expected data
                this.validateData(expectedGridData, mergedData);
            });
        });

        // Validate the header
        this.fetchAllHeaderData().then((headerData) => {
            // Validate the header against the expected header
            this.validateData(expectedHeaders, headerData, true);
        });
    }

    // Function to validate the data
    private validateData(expectedGridData: string[][], mergedData: string[][], isHeaderCompare = false): void {
        const mismatches: string[] = [];

        for (let i = 0; i < expectedGridData.length; i++) {
            for (let j = 0; j < expectedGridData[i].length; j++) {
                // Check if the row exists in mergedData
                if (i < mergedData.length) {
                    // Check if the cell exists in the row
                    if (j < mergedData[i].length) {
                        if (expectedGridData[i][j] !== mergedData[i][j]) {
                            mismatches.push(`Data mismatch at row ${i + 1}, column ${j + 1}: expected "${expectedGridData[i][j]}", got "${mergedData[i][j]}"`);
                        }
                    } else {
                        mismatches.push(`Data mismatch at row ${i + 1}, column ${j + 1}: expected "${expectedGridData[i][j]}", got no data`);
                    }
                } else {
                    mismatches.push(`Data mismatch at row ${i + 1}, column ${j + 1}: expected "${expectedGridData[i][j]}", got no row`);
                }
            }
        }

        if (mismatches.length > 0) {
            // error msg to consider if header comparison is needed
            if (isHeaderCompare) {
                throw new Error(`Ag grid Header mismatches found in: ${mismatches.join(', ')}`);
            } else {
                throw new Error(`Ag grid Data mismatches found in: ${mismatches.join(', ')}`);
            }
        }
    }

    // Function to fetch all row data
    private fetchAllRowData(): Cypress.Chainable<string[][]> {
        const mergedData: string[][] = [];

        return this.getRowsInCenterContainer().each(($row, rowIndex) => {
            return this.fetchRowData($row, rowIndex).then((rowData) => {
                mergedData.push(rowData);
            });
        }).then(() => {
            return mergedData;
        });
    }

    // Function to fetch row data from both containers
    private fetchRowData($row: JQuery, rowIndex: number): Cypress.Chainable<string[]> {
        const rowData: string[] = [];

        // Check if the first container exists and fetch cells from it
        return this.getRowsInPinnedLeftContainer().then(($firstContainerRows) => {
            if ($firstContainerRows.length > 0) {
                cy.wrap($firstContainerRows.eq(rowIndex)).find(this.NON_ACTION_CELLS_IN_FIRST_CONTAINER).each(($cell) => {
                    rowData.push($cell.text().trim());
                });
            }
        }).then(() => {
            // Fetch cells from second container and append to rowData
            return cy.wrap($row).find(this.CELL).each(($cell) => {
                rowData.push($cell.text().trim());
            }).then(() => {
                return rowData;
            });
        });
    }

    // Function to fetch all row data
    private fetchAllHeaderData(): Cypress.Chainable<string[][]> {
        const mergedData: string[][] = [];
        return this.getHeaderRowsInCenterContainer().each(($row, rowIndex) => {
            return this.fetchHeaderRowData($row, rowIndex).then((rowData) => {
                mergedData.push(rowData);
            });
        }).then(() => {
            return mergedData;
        });
    }

    private fetchHeaderRowData($row: JQuery, rowIndex: number): Cypress.Chainable<string[]> {
        const rowData: string[] = [];

        // Check if the first container exists and fetch cells from it
        return this.getHeaderRowsInPinnedLeftContainer().then(($firstContainerRows) => {
            if ($firstContainerRows.length > 0) {
                cy.wrap($firstContainerRows.eq(rowIndex)).find(this.HEADER_CELLS_IN_FIRST_PINNED_CONTAINER).each(($cell) => {
                    rowData.push($cell.text().trim());
                });
            }
        }).then(() => {
            // Fetch cells from second container and append to rowData
            return cy.wrap($row).find(this.HEADER_CELL).each(($cell) => {
                rowData.push($cell.text().trim());
            }).then(() => {
                return rowData;
            });
        });
    }

    expandRow(rowDescriptionTitle: string): void {
        const groupCollapsedIcon = cy.contains(this.ROW, rowDescriptionTitle).find(this.GROUP_COLLAPSED_ICON);
        groupCollapsedIcon.click();
        groupCollapsedIcon.parent().should('have.attr', 'aria-hidden');
    }

    performRightClickAction(firstCellTitle: string, menuOptionLabel: RightClickMenuOption, subMenuOptionLabel?: RightClickSubMenuOption): void {
        const clickMenuOption = () => cy.contains(this.ROW, firstCellTitle).find(this.CELL).contains(firstCellTitle).rightclick()
            .then(() => {
                this.getContextMenu()
                    .should('be.visible')
                    .contains('span', menuOptionLabel)
                    .should('be.visible')
                    .click();
            });

        if (!subMenuOptionLabel) {
            clickMenuOption();
        } else {
            clickMenuOption().then(() => {
                // giving enough time for the sub-menu to appear to click on it
                cy.wait(500);
                this.getSubMenu()
                    .should('be.visible')
                    .contains('span', subMenuOptionLabel)
                    .should('be.visible')
                    .click();
            });
        }
    }
}

export enum RightClickMenuOption {
    EXPAND_ALL_LEVELS = 'Expand All Levels',
    COLLAPSE_ALL_LEVELS = 'Collapse All Levels',
    OPEN_CHART = 'Open Chart'
}

export type RightClickSubMenuOption = RightClickOpenChartMenuOption | RightClickOpenTableMenuOption; // Add more options as needed;

enum RightClickOpenChartMenuOption {
    BAR_CHART = 'Bar chart',
    STACKED_BAR_CHART = 'Stacked bar chart',
    PIE_CHART = 'Pie chart',
    TIME_SERIES_CHART = 'Time series chart'
}

enum RightClickOpenTableMenuOption {
    SECURITY_CONTRIBUTORS = 'Security contributors'
}

export const gridPage = new GridPage();
