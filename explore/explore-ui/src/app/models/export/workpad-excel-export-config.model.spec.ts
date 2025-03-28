import {WorkpadExcelExportConfig} from './workpad-excel-export-config.model';
import {ExcelExportOutlineStyle} from '@enums/export/excel-export-outline-style.enum';
import {ExportConstants} from '@constants/export.constants';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';

/**
 * Test cases for the WorkpadExcelExportConfig model
 */
describe('Models/Export', function () {
    describe('WorkpadExcelExportConfig tests', function () {

        /**
         * Validates default values for constructor
         */
        it('Validates default values from constructor', function () {
            const workpadExcelExportConfig: WorkpadExcelExportConfig = new WorkpadExcelExportConfig();

            expect(workpadExcelExportConfig.oneWorkbookPerWorkpad).toBeFalsy();
            expect(workpadExcelExportConfig.isWorkspaceRequest).toBeFalsy();
        });

        /**
         * Tests serialize methods
         */
        it('Tests serialize/deserialize methods', function () {
            const workpadExcelExportConfig: WorkpadExcelExportConfig = new WorkpadExcelExportConfig();

            workpadExcelExportConfig.oneWorkbookPerWorkpad = true;
            workpadExcelExportConfig.isWorkspaceRequest = true;

            // Serialize the WorkpadExcelExportConfig
            const serialized: any = workpadExcelExportConfig.serialize();
            let deserializedWorkpadExcelExportConfig = new WorkpadExcelExportConfig(serialized);
            expect(deserializedWorkpadExcelExportConfig.oneWorkbookPerWorkpad).toBeTruthy();

            deserializedWorkpadExcelExportConfig = new WorkpadExcelExportConfig(new ExcelExportConfig());
            expect(deserializedWorkpadExcelExportConfig.isWorkspaceRequest).toBeFalsy();
            expect(deserializedWorkpadExcelExportConfig.oneWorkbookPerWorkpad).toBeFalsy();

            // Test the equality of the serialized objects
            expect(serialized).toEqual({
                'configType': 'WorkpadExcelExportConfig',
                'visibleOnly': false,
                'suppressRowShading': false,
                'isGroupingEnabled': false,
                'fullyExpanded': true,
                'isFilterFriendly': false,
                'freezeColumnHeaders': false,
                'exportToSingleSheet': false,
                'useMergedCellFooter': false,
                'outlineStyle': ExcelExportOutlineStyle[1],
                'appendTimestamp': false,
                'oneWorkbookPerWorkpad': true,
                'type': ExportConstants.EXCEL_TYPE_XLSX,
                'includeTimePeriod': true
            });
        });
    });
});
