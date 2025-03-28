/**
 * Enum for excel export outline style
 */
import {ExportConstants} from '@constants/export.constants';

export enum ExcelExportOutlineStyle {
    NONE = 0, // No outline for Excel exports
    HORIZONTAL = 1, // Horizontal outline style for Excel exports
    VERTICAL = 2 // Vertical outline style for Excel exports
}
// tslint:disable-next-line:no-namespace
export namespace ExcelExportOutlineStyle {

    /**
     * returns the display name corresponding to each ExcelExportOutlineStyle.
     */
    export function getDisplayLabel(orientation: ExcelExportOutlineStyle): string {
        switch (orientation) {
            case ExcelExportOutlineStyle.NONE :
                return ExportConstants.NOT_SPECIFIED;
            case ExcelExportOutlineStyle.HORIZONTAL :
                return 'Horizontal';
            case ExcelExportOutlineStyle.VERTICAL :
                return 'Vertical';
        }
    }

    /**
     * Get outlineStyles list with its values and label
     */
    export function getAllExcelExportOutlineStyles(): { value: ExcelExportOutlineStyle, label: string }[] {
        const outlineStyles: ExcelExportOutlineStyle[] = Object.keys(ExcelExportOutlineStyle).map(k => ExcelExportOutlineStyle[k]).filter(v => typeof v === 'number') as number[];
        return outlineStyles.map(item => ({
            value: item,
            label: getDisplayLabel(item)
        }));
    }
}
