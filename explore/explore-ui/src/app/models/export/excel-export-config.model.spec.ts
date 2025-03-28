import {ExcelExportConfig} from './excel-export-config.model';
import {ExcelExportOutlineStyle} from '../../enums/export/excel-export-outline-style.enum';

/**
 * Test class for the ExcelExportConfig model
 */
describe('Models/Export', function () {
    describe('ExcelExportConfig tests', function () {

        /**
         * Validates default values for constructor
         */
        it('Validates default values from constructor', function () {
            const excelExportConfig: ExcelExportConfig = new ExcelExportConfig();

            expect(excelExportConfig.visibleOnly).toBeFalsy();
            expect(excelExportConfig.suppressRowShading).toBeFalsy();
            expect(excelExportConfig.isGroupingEnabled).toBeFalsy();
            expect(excelExportConfig.fullyExpanded).toBeTruthy();
            expect(excelExportConfig.isFilterFriendly).toBeFalsy();
            expect(excelExportConfig.freezeColumnHeaders).toBeFalsy();
            expect(excelExportConfig.exportToSingleSheet).toBeFalsy();
            expect(excelExportConfig.useMergedCellFooter).toBeFalsy();
            expect(excelExportConfig.outlineStyle).toEqual(ExcelExportOutlineStyle.HORIZONTAL);
            expect(excelExportConfig.appendTimestamp).toBeFalsy();
        });

        /**
         * Tests serialize/deserialize methods
         */
        it('Tests serialize/deserialize methods', function () {
            let excelExportConfig: ExcelExportConfig = new ExcelExportConfig();

            excelExportConfig.isGroupingEnabled = true;
            excelExportConfig.isFilterFriendly = true;
            excelExportConfig.useMergedCellFooter = true;
            excelExportConfig.outlineStyle = ExcelExportOutlineStyle.NONE;
            // Serialize the ExcelExportConfig
            let serialized: any = excelExportConfig.serialize();

            // Construct a new ExcelExportConfig via deserialization
            let deserialized: ExcelExportConfig = new ExcelExportConfig(serialized);

            // Test the equality of the ExcelExportConfig objects
            testEquals(excelExportConfig, deserialized);
        });

        /**
         * Tests equality of two ExcelExportConfig objects
         */
        function testEquals(first: ExcelExportConfig, second: ExcelExportConfig): void {
            expect(first.visibleOnly).toEqual(second.visibleOnly);
            expect(first.suppressRowShading).toEqual(second.suppressRowShading);
            expect(first.isGroupingEnabled).toEqual(second.isGroupingEnabled);
            expect(first.fullyExpanded).toEqual(second.fullyExpanded);
            expect(first.isFilterFriendly).toEqual(second.isFilterFriendly);
            expect(first.freezeColumnHeaders).toEqual(second.freezeColumnHeaders);
            expect(first.exportToSingleSheet).toEqual(second.exportToSingleSheet);
            expect(first.useMergedCellFooter).toEqual(second.useMergedCellFooter);
            expect(first.outlineStyle).toEqual(second.outlineStyle);
        }
    });
});
