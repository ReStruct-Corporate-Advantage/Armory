import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ExcelExportOutlineStyle} from '@enums/export/excel-export-outline-style.enum';
import {AuxCheckboxChangedDetailInterface, AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {ExportConstants, ExportLevel} from '../../../../constants';
import {AppStore} from '../../../../app.store';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExportUtils} from '@utils/export/export.utils';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {some} from 'lodash';
import {WorkpadExportComposite} from '@models/export/export-composite/workpad-export-composite.model';

@Component({
    selector: 'app-excel-export-options',
    templateUrl: './excel-export-options.component.html',
    styleUrls: ['./excel-export-options.component.scss']
})

/**
 * Class for the excelExportOptions component
 */
export class ExcelExportOptionsComponent implements OnInit, OnChanges {
    @Input() exportConfig: ExcelExportConfig;
    @Input() horizontalView = false;
    @Input() exportComposite: ExportComposite;

    outlineStyleOptions: AuxRadioInterface[] = [];
    sizeRadioOptions: AuxRadioInterface[] = [];
    breakdownDisplayOptions: AuxRadioInterface[] = [];
    isOneWorkbookChecked: boolean;
    showWorkpadOptions: boolean;
    isOutlineStyleChecked: boolean;
    isOneWidgetPerSheet: boolean;
    selectedOutlineStyle = 1;
    isWidgetLayoutOptionsDisabled: boolean;
    showOnlyMiscellaneousOptions: boolean;
    isAWC: boolean = AppStore.isAWC;
    showTimePeriodSheetName = true;

    ngOnInit() {
        this.initializeAuxOptions();
        this.showWorkpadOptions = this.exportConfig instanceof WorkpadExcelExportConfig;
        this.isOneWorkbookChecked = (this.exportConfig as WorkpadExcelExportConfig).oneWorkbookPerWorkpad;
        // Disable widget layout options for widget level export and enable only miscellaneous options for table exports other than widget
        if (this.exportConfig.exportLevel === ExportLevel.WIDGET) {
            this.isWidgetLayoutOptionsDisabled = true;
        } else if (this.exportConfig.exportLevel === ExportLevel.GRID) {
            this.showOnlyMiscellaneousOptions = true;
        }
        this.showTimePeriodSheetName = this.shouldShowTimePeriodSheetName();
    }

    ngOnChanges(changes) {
        // If a new ExcelExportConfig is passed in (when switching between batch rows), we need to re-initialize the radio group options so the correct values are checked
        if (changes.exportConfig && !changes.exportConfig.isFirstChange()) {
            this.initializeAuxOptions();
        }
    }

    /**
     * Initializes the fields to populate aux component options
     */
    initializeAuxOptions(): void {
        this.populateExcelSizeRadioOptions();
        this.breakdownDisplayOptions = ExportUtils.populateBreakdownDisplayOptions(this.exportConfig.isFilterFriendly, this.exportConfig.isGroupingEnabled);
        this.isOutlineStyleChecked = (this.exportConfig.outlineStyle === ExcelExportOutlineStyle.HORIZONTAL || this.exportConfig.outlineStyle === ExcelExportOutlineStyle.VERTICAL);
        this.outlineStyleOptions = ExportUtils.populateExcelExportOutlineStyleOptions(this.isOutlineStyleChecked, this.exportConfig.outlineStyle);
        this.isOneWidgetPerSheet = !this.exportConfig.exportToSingleSheet;
    }

    /**
     * Method to check if we want to show the time period sheet name option
     */
    shouldShowTimePeriodSheetName(): boolean {
        if (!this.exportComposite) {
            return false;
        }
        if (this.exportComposite instanceof WorkspaceExportComposite) {
            // If it's a workspace export, check all widgets of all reports of all workpads for any returns widget
            return some(this.exportComposite.getWorkpads(), workpad => some(workpad.reports, report => some(report.widgets, widget => widget.configType === WidgetConfigType.RETURNS)));
        } else if (this.exportComposite instanceof WorkpadExportComposite) {
            // If it's a workpad export, check all widgets of all reports for any returns widget
            return some(this.exportComposite.workpad.reports, report => some(report.widgets, widget => widget.configType === WidgetConfigType.RETURNS));
        } else if (ExportUtils.getExportType(this.exportComposite) === ExportLevel.REPORT) {
            // If it's a report export, check all widgets for any returns widget
            return some(this.exportComposite.report?.widgets, widget => widget.configType === WidgetConfigType.RETURNS);
        } else {
            // Else, just check if the widget is a returns widget
            return this.exportComposite.widget.configType === WidgetConfigType.RETURNS;
        }
    }

    /**
     * Method to init the Fully expanded or visible data only radio options
     */
    populateExcelSizeRadioOptions(): void {
        this.sizeRadioOptions = [
            {
                label: ExportConstants.EXPORT_FULLY_EXPANDED,
                checked: this.exportConfig.fullyExpanded
            },
            {
                label: ExportConstants.VISIBLE_DATA_ONLY,
                checked: this.exportConfig.visibleOnly
            }
        ];
    }



    /**
     * Change handler for size radio options
     */
    onSizeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.exportConfig.visibleOnly = (event.detail.value.label === ExportConstants.VISIBLE_DATA_ONLY);
        this.exportConfig.fullyExpanded = (event.detail.value.label === ExportConstants.EXPORT_FULLY_EXPANDED);
    }

    /**
     * Change handler for One widget per sheet and all widgets on one sheet radio options
     */
    onOneWidgetRadioChanged(): void {
        this.isOneWidgetPerSheet = !this.isOneWidgetPerSheet;
        this.exportConfig.exportToSingleSheet = !this.exportConfig.exportToSingleSheet;
    }

    /**
     * Change handler for breakdown display radio options
     */
    onBreakdownDisplayChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.exportConfig.isFilterFriendly = (event.detail.value.label === ExportConstants.FLAT_DATA_FILTERING);
        this.exportConfig.isGroupingEnabled = (event.detail.value.label === ExportConstants.GROUPED_DATA);
    }

    /**
     * Change handler for Outline checkbox
     * If checked sets the default value of outline style as horizontal
     * If unchecked the outline style is set to none
     */
    onOutlineCheckboxChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.outlineStyle = (event.detail.value.checked) ? this.selectedOutlineStyle : ExcelExportOutlineStyle.NONE;
        this.isOutlineStyleChecked = !this.isOutlineStyleChecked;
        this.outlineStyleOptions = ExportUtils.populateExcelExportOutlineStyleOptions(this.isOutlineStyleChecked, this.exportConfig.outlineStyle);
    }

    /**
     * Change handler for outline style radio options
     */
    onOutlineStyleChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.exportConfig.outlineStyle = event.detail.value.eventData;
        this.selectedOutlineStyle = event.detail.value.eventData;
    }

    /**
     * Handler to update the freeze column header value
     */
    updateFreezeColumnHeadersValue(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.freezeColumnHeaders = event.detail.value.checked;
    }

    /**
     * Handler to update the suppress row shading value
     */
    updateSuppressRowShading(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.suppressRowShading = event.detail.value.checked;
    }

    /**
     * Handler to update the use merged cell footer value
     */
    updateUseMergedCellFooterValue(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.useMergedCellFooter = event.detail.value.checked;
    }

    /**
     * Handler to update the one workbook per workpad flag
     */
    updateOneWorkbookPerWorkpad(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        (this.exportConfig as WorkpadExcelExportConfig).oneWorkbookPerWorkpad = event.detail.value.checked;
        this.isOneWorkbookChecked = event.detail.value.checked;
    }

    /**
     * Append Time stamp change handler
     */
    onAppendTimestampChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.appendTimestamp = event.detail.value.checked;
    }

    /**
     * Append Timeperiod to sheet name change handler
     */
    updateIncludeTimePeriod(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.includeTimePeriod = event.detail.value.checked;
    }
}
