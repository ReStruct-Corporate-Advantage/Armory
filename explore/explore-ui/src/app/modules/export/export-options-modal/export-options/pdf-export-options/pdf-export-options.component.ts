import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {AuxCheckboxChangedDetailInterface, AuxNumericStepperValueChangedDetailInterface, AuxRadioGroupChangedDetailInterface, AuxRadioInterface, AuxSelectOption, AuxSelectSelectionChangedDetailInterface, AuxTextInputValueChangedDetailInterface, Validator} from '@blk/aladdin-angular-components';
import {PDFExportOrientation} from '@enums/export/pdf-export-orientation.enum';
import {PDFPageFormat} from '@enums/export/pdf-page-format.enum';
import {PDFPageLayout} from '@enums/export/pdf-page-layout.enum';
import {PDFPageMargin} from '@models/export/pdf-page-margin.model';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {TablePDFScaling} from '@enums/export/table-pdf-scaling.enum';
import {ExportConstants, ExportLevel} from '../../../../../constants';
import {isNil} from 'lodash';
import {AppStore} from '../../../../../app.store';
import {PDFLogoPosition} from '@enums/export/pdf-logo-position.enum';
import {LogoConfig} from '@models/export/logo-config.model';
import {ExploreSelectOption, ExploreSelectOptionGroup, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {ExportService} from '@services/export/export.service';

@Component({
    selector: 'app-pdf-export-options',
    templateUrl: './pdf-export-options.component.html',
    styleUrls: ['./pdf-export-options.component.scss']
})
/**
 * Component for the pdf export Options
 */
export class PdfExportOptionsComponent implements OnInit, OnChanges {
    @Input() exportConfig: PDFExportConfig;
    @Input() horizontalView = false;
    @Output() imageUploaded = new EventEmitter<string | ArrayBuffer>();

    orientationOptions: AuxRadioInterface[] = [];
    pageFormatOptions: ExploreSelectOptionGroup[];
    layoutOptions: ExploreSelectOptionGroup[];
    marginOptions: ExploreSelectOptionGroup[];
    logoPositionOptions: ExploreSelectOptionGroup[];
    tablePDFScalingOptions: ExploreSelectOptionGroup[];
    showPrintAsIsOption = false;
    isPageLayoutDisabled = false;
    showCustomLevel = false;
    customLevelDepth: number;
    validator: Validator[];
    tablePDFExportOptions: AuxRadioInterface[] = [];
    isTableWidget: boolean;
    exportForTableOtherThanWidget: boolean;
    isAWC: boolean = AppStore.isAWC;
    imgURL: any;
    // Kept this boolean as true until token is created
    isLogoFeatureEnabled: boolean;

    ngOnInit() {
        this.initializeAuxOptions();

        this.isTableWidget = this.exportConfig instanceof TablePDFExportConfig;

        if (this.isTableWidget) {
            this.showPrintAsIsOption = true;
            this.showCustomLevel = (this.exportConfig as TablePDFExportConfig).customLevel;
            this.customLevelDepth = (this.exportConfig as TablePDFExportConfig).customLevelDepth;
            // Init the Table PDF scaling options
            this.initializeTablePDFScalingOptions();

            // Init the table PDF Export options
            this.initializeTablePDFExportOptions();
        }

        this.exportForTableOtherThanWidget = this.exportConfig.exportLevel === ExportLevel.GRID;
        // Disable the Page Layout dropdown for Widgets and tables other than widget since layout is single widget and append time stamp is true
        this.isPageLayoutDisabled = (this.exportConfig.exportLevel === ExportLevel.WIDGET && this.exportConfig.layout === PDFPageLayout.W1X1) || this.exportForTableOtherThanWidget;
        // Validator to ensure that only numbers are entered in margin input text.
        this.validator = [{
            validate: (value: number) => {
                return !isNil(value) && !isNaN(value);
            },
            errorMessage: 'Invalid input'
        }];

        this.isLogoFeatureEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_LOGO_FEATURE_PDF);
        // Keeping commented till token implementation is started
        // if (this.isLogoFeatureEnabled) {
        //     // Init the logo position options
        //     this.initializeLogoPositionOptions();
        // }
        if (this.exportConfig.logoConfig.logoPresent && !this.exportConfig.logoConfig.hasValidWidthAndHeight()) {
            ExportService.loadLogoInfo(this.exportConfig.logoConfig);
        }
    }

    ngOnChanges(changes): void {
        // If a new PDFExportConfig is passed in (when switching between batch rows), we need to re-initialize the radio group options so the correct values are checked
        if (changes.exportConfig && !changes.exportConfig.isFirstChange()) {
            this.initializeAuxOptions();
        }
        if (!this.exportConfig.logoConfig) {
            this.exportConfig.logoConfig = new LogoConfig();
        }
    }

    /**
     * Initializes the fields to populate the aux component options
     */
    initializeAuxOptions(): void {
        // Init the orientation options
        this.initializePDFExportOrientationOptions();
        // Init the PDF page format options
        this.initializePDFPageFormatOptions();
        // Init the PDF page layout options
        this.initializePDFPageLayoutOptions();
        // Init the PDF page margin options
        this.initializePDFPageMarginOptions();
        // Init the PDF logo position options
        this.initializeLogoPositionOptions();
    }

    /**
     * Method to init the PDF export orientation options
     */
    private initializePDFExportOrientationOptions(): void {
        this.orientationOptions = [
            {
                label: 'Portrait',
                eventData: PDFExportOrientation.PORTRAIT,
                checked: this.exportConfig.orientation === PDFExportOrientation.PORTRAIT
            },
            {
                label: 'Landscape',
                eventData: PDFExportOrientation.LANDSCAPE,
                checked: this.exportConfig.orientation === PDFExportOrientation.LANDSCAPE
            }
        ];
    }

    /**
     * Method to init the PDF page format options
     */
    private initializePDFPageFormatOptions(): void {
        this.pageFormatOptions = [new ExploreSelectOptionGroup(PDFPageFormat.getAllPDFPageFormats().map(item =>
            new ExploreSelectOption(item.label, item.value, item.value === this.exportConfig.pageFormat)
        ))];
    }

    /**
     * Method to init the PDF page layout options
     */
    private initializePDFPageLayoutOptions(): void {
        this.layoutOptions = [new ExploreSelectOptionGroup(PDFPageLayout.getAllPDFPageLayouts().map(item =>
            new ExploreSelectOption(item.label, item.value, item.value === this.exportConfig.layout)
        ))];
    }

    /**
     * Method to init the PDF page margin options
     */
    private initializePDFPageMarginOptions(): void {
        this.marginOptions = [new ExploreSelectOptionGroup([
            new ExploreSelectOption(PDFPageMargin.getLabel(PDFPageMargin.NORMAL), PDFPageMargin.NORMAL),
            new ExploreSelectOption(PDFPageMargin.getLabel(PDFPageMargin.NARROW), PDFPageMargin.NARROW),
            new ExploreSelectOption(PDFPageMargin.getLabel(PDFPageMargin.MODERATE), PDFPageMargin.MODERATE),
            new ExploreSelectOption(PDFPageMargin.getLabel(PDFPageMargin.WIDE), PDFPageMargin.WIDE),
            new ExploreSelectOption(PDFPageMargin.getLabel(PDFPageMargin.CUSTOM), this.exportConfig.pageMargin.isCustom ? this.exportConfig.pageMargin : PDFPageMargin.CUSTOM)
        ])];
        this.marginOptions[0].values.filter(marginOption => (marginOption.value as PDFPageMargin).equals(this.exportConfig.pageMargin))[0].isSelected = true;
    }

    /**
     * Method to init the PDF Logo position placing options
     */
    private initializeLogoPositionOptions(): void {
        this.logoPositionOptions = [new ExploreSelectOptionGroup(PDFLogoPosition.getAllPDFLogoPosition().map(item =>
            new ExploreSelectOption(item.label, item.value, item.value === this.exportConfig.logoConfig.logoPosition)
        ))];
    }

    /**
     * Method to init the Table PDF scaling options
     */
    private initializeTablePDFScalingOptions() {
        this.tablePDFScalingOptions = [new ExploreSelectOptionGroup([
            new ExploreSelectOption(TablePDFScaling.getLabel(TablePDFScaling.NO_SCALING), TablePDFScaling.NO_SCALING, (this.exportConfig as TablePDFExportConfig).scaling === TablePDFScaling.NO_SCALING),
            new ExploreSelectOption(TablePDFScaling.getLabel(TablePDFScaling.FIT_ALL_COLS), TablePDFScaling.FIT_ALL_COLS, (this.exportConfig as TablePDFExportConfig).scaling === TablePDFScaling.FIT_ALL_COLS)
        ])];
    }

    /**
     * Method to init the Table PDF export options
     */
    private initializeTablePDFExportOptions(): void {
        this.tablePDFExportOptions = [
            {
                label: ExportConstants.EXPORT_FULLY_EXPANDED,
                eventData: ExportConstants.EXPORT_FULLY_EXPANDED,
                checked: (this.exportConfig as TablePDFExportConfig).fullyExpanded
            },
            {
                label: ExportConstants.VISIBLE_DATA_ONLY,
                eventData: ExportConstants.VISIBLE_DATA_ONLY,
                checked: (this.exportConfig as TablePDFExportConfig).visibleOnly
            },
            {
                label: ExportConstants.EXPORT_CUSTOM_LEVEL,
                eventData: ExportConstants.EXPORT_CUSTOM_LEVEL,
                checked: (this.exportConfig as TablePDFExportConfig).customLevel
            }
        ];
    }

    /**
     * Orientation change handler
     */
    onOrientationChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.exportConfig.orientation = event.detail.value.eventData;
    }

    /**
     * Page Size selection handler
     */
    onPageSizeSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.exportConfig.pageFormat = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Page Layout selection handler
     */
    onPageLayoutSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.exportConfig.layout = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Page margin selection handler
     */
    onPageMarginSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.exportConfig.pageMargin = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Page margin Top Change handler
     */
    onPageMarginTopChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (this.validator[0].validate(event.detail.value)) {
            this.exportConfig.pageMargin.top = +event.detail.value;
        }
    }

    /**
     * Page margin Right Change handler
     */
    onPageMarginRightChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (this.validator[0].validate(event.detail.value)) {
            this.exportConfig.pageMargin.right = +event.detail.value;
        }
    }

    /**
     * Page margin Bottom Change handler
     */
    onPageMarginBottomChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (this.validator[0].validate(event.detail.value)) {
            this.exportConfig.pageMargin.bottom = +event.detail.value;
        }
    }

    /**
     * Page margin Left Change handler
     */
    onPageMarginLeftChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (this.validator[0].validate(event.detail.value)) {
            this.exportConfig.pageMargin.left = +event.detail.value;
        }
    }

    /**
     * Print As Is change handler
     */
    onPrintAsIsChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.printAsIs = event.detail.value.checked;
    }

    /**
     * TablePDFExportConfig's PDF scaling selection handler
     */
    onTablePDFScalingSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        (this.exportConfig as TablePDFExportConfig).scaling = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * TablePDFExportOptions change handler
     */
    onTablePDFExportOptionsChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (event.detail.value.eventData === ExportConstants.EXPORT_FULLY_EXPANDED) {
            this.updateTablePDFExportOptions(true, false, false, false);
        } else if (event.detail.value.eventData === ExportConstants.VISIBLE_DATA_ONLY) {
            this.updateTablePDFExportOptions(false, true, false, false);
        } else {
            this.updateTablePDFExportOptions(false, false, true, true);
        }
    }

    /**
     * Update either fullyExpanded, visibleOnly, or customLevel and customLevelDepth on a TablePDFExportConfig
     */
    private updateTablePDFExportOptions(fullyExpanded: boolean, visibleOnly: boolean, customLevel: boolean, showCustomLevel: boolean) {
        const exportConfig = this.exportConfig as TablePDFExportConfig;
        exportConfig.fullyExpanded = fullyExpanded;
        exportConfig.visibleOnly = visibleOnly;
        exportConfig.customLevel = customLevel;
        this.showCustomLevel = showCustomLevel;
    }

    /**
     * Custom Level Depth Change handler
     */
    onCustomLevelDepthChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        (this.exportConfig as TablePDFExportConfig).customLevelDepth = +event.detail.value;
    }

    /**
     * Append Time stamp change handler
     */
    onAppendTimestampChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.appendTimestamp = event.detail.value.checked;
    }

    /**
     * Function to get choice if user wants the logo or not
     */
    onLogoPresentChanges(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.exportConfig.logoConfig.logoPresent = event.detail.value.checked;
    }

    /**
     * Function to check if the logo position is changed , to any corner of the page
     */
    onLogoPositionChanged(event: CustomEvent<AuxSelectOption>): void {
        this.exportConfig.logoConfig.logoPosition = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Extract the imagData from the imageFile that is being uploaded by user
     */
    processFile(event: CustomEvent) {
        const fileImage = event.detail.newValue[0];
        const reader = new FileReader();
        reader.readAsDataURL(fileImage);
        reader.onload = (_event) => {
            this.imgURL = reader.result;
            this.exportConfig.logoConfig.logoImageFile = this.imgURL;
            ExportService.loadLogoInfo(this.exportConfig.logoConfig);
        };
    }

    /**
     * Checkbox provides the option whether to see the preview of the logo or not
     */
    logoPreview(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.exportConfig.logoConfig.showLogoPreview = event.detail.value.checked;
    }
}
