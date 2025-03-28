import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AuxTextArea} from '@blk/aladdin-angular-components';
import {
    ColumnConfig,
    ColumnOptionMetaDataInterface,
    CoreColumnUtils,
    CoreWidgetConfigStore,
    CustomCalcParameters,
    RestrictedOptionInterface,
    TelemetryActionConstants,
    TelemetryService,
    WidgetInput
} from '@blk/explore-ui-core';
import {isEmpty, isNil, isNumber, union} from 'lodash';
import {CustomCalculationConstants} from '../../../constants';
import {CustomCalculationColumnOption} from '../../../models/column-option/custom-calculation-column-option.model';
import {CustomCalculationMeasureNodeColumnOption} from '../../../models/column-option/custom-calculation-measure-node-column-option.model';
import {ColumnSet} from '../../../models/column-set/column-set.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Component for custom calculation column options
 */
@Component({
    selector: 'explore-custom-calculation-column-option',
    templateUrl: './custom-calculation-column-option.component.html',
    styleUrls: ['./custom-calculation-column-option.component.scss']
})
export class CustomCalculationColumnOptionComponent extends BaseColumnOptionComponent<CustomCalculationColumnOption> {
    public static readonly OPTION_KEY: string = 'customCalculation';

    @Output() expressionUpdated = new EventEmitter();

    @ViewChild('textAreaComponent', {static: false}) textAreaComponent: AuxTextArea;

    @Input() isOnlyArithmeticOperationSupported?: boolean;

    @Input() isStringColumnNotSupported?: boolean;

    /**
     *  additional column options to be added.
     */
    columnOptionsToAdd: ColumnOptionMetaDataInterface[];
    showColumnMeasures = false;
    selectedMeasureSummary: any[];
    columnMeasures: ColumnConfig[];

    /**
     * shortcuts entry map
     */
    readonly shortcutsEntry: Map<string, string> = new Map<string, string>(Object.entries(CustomCalculationConstants.SHORTCUT_ENTRY));

    /**
     * Set of arithmeticOperation operators
     */
    readonly arithmeticOperation: any = CustomCalculationConstants.ARITHMETIC_OPERATIONS;

    /**
     * Set of some mathematics function
     */
    readonly mathFunctionOperation: any = CustomCalculationConstants.MATH_FUNCTION_OPERATIONS;

    modifiedRestrictedColumnOptions: RestrictedOptionInterface;

    /**
     * Initialize the component fields
     */
    initializeComponent(): void {
        super.initializeComponent();
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);
        this.modifiedRestrictedColumnOptions = {
            sections: union(this.restrictedColumnOptions.sections, widgetConfig?.customCalculationColumn?.restrictedColumnOptions.sections),
            // Also restrict column options that are singleSelectOptions so the column option components know how to handle
            options: [{section: 'singleSelectOptions', options: ['spawnsChildColumns']}]
        };
        const measureNodeColumnOption = widgetConfig.customCalculationColumn.measureNodeColumnOption;
        measureNodeColumnOption['isPgsCustomCalculation'] = this.column?.columnTag === CustomCalculationConstants.PGS_CUSTOM_CALCULATION;
        const addColumnOption = !this.modifiedRestrictedColumnOptions.sections.includes(measureNodeColumnOption['columnOptionConfigType']);
        this.columnOptionsToAdd = addColumnOption ? [measureNodeColumnOption] : [];
        this.columnMeasures = Object.values(this.optionValue.measureMapping);
        this.addTitleToDeserializeColumns(this.columnMeasures);
        this.prepareMeasureDisplayContent(this.columnMeasures);
    }

    /**
     * Reset Column title
     */
    protected addTitleToDeserializeColumns(columnMeasures: ColumnConfig[]): void {
        // List to keep track of already covered measures
        const measuresCovered: ColumnConfig[] = [];
        columnMeasures.forEach(currentMeasure => {
            // if current measure is already covered, simply return
            if (measuresCovered.filter(measureCovered => measureCovered.isSameColumnConfigType(currentMeasure)).length > 0) {
                return;
            }

            // get title from column definition
            const colDefTitle = CoreColumnUtils.getColumnDefByTagAndUse(currentMeasure.columnTag, currentMeasure.positionColumnType).title;
            // get all column configs with same type as current measure & provide unique number for each
            // since this lot has been handled, push it into covered measures
            columnMeasures
                .filter(measure => measure.isSameColumnConfigType(currentMeasure))
                .forEach((duplicateMeasure, i) => {
                    duplicateMeasure.title = i === 0 ? colDefTitle : colDefTitle + ' ' + i.toString();
                    measuresCovered.push(duplicateMeasure);
                });
        });
    }

    /**
     * This method prepares measure Display table content based on passed alias and measures.
     */
    prepareMeasureDisplayContent(measures: ColumnConfig[], updateMapping?: boolean): void {
        // if the measure mappings need to be updated, reset it
        if (updateMapping) {
            this.optionValue.measureMapping = {};
        }
        let measureAliasList: string[] = [];
        this.selectedMeasureSummary = isEmpty(measures)
            ? []
            : measures
                .map((measure, i) => {
                    // filter out the option values for custom calc from the lot
                    const matchingMeasureModes = measure.optionValues.filter(optionValue => optionValue.configType === CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE);
                    // if option value found, prepare column measure nodes for the display table
                    if (!isEmpty(matchingMeasureModes)){
                        const measureAlias: string = this.getMeasureAlias(i, measureAliasList);
                        measureAliasList.push(measureAlias);
                        // push updated measure mappings
                        if (updateMapping) {
                            this.optionValue.measureMapping[measureAlias] = measure;
                        }

                        return {
                            title: measure.title,
                            nodeType: CustomCalculationMeasureNodeColumnOption.getDisplayNodeName((matchingMeasureModes[0] as CustomCalculationMeasureNodeColumnOption).nodeTypeValue),
                            alias: measureAlias
                        };
                    }
                })
                // simply filter out the ones where option values were not present
                .filter(measureNode => !isNil(measureNode));
    }

    /**
     * Returns config type of the column option
     */
    protected getOptionValueConfigType(): string {
        return CustomCalculationColumnOption.CONFIG_TYPE;
    }

    onExpressionUpdate(value: string) {
        if (this.optionValue.expression !== value) {
            this.optionValue.expression = value;
        }
        this.expressionUpdated.emit();
    }

    /**
     * Add text to the textarea acc. to the clicked-button
     */
    addTextToTextArea(event: any) {
        this.trackFormulaShortcutClickViaTelemetry(event);
        const textAreaElement = this.textAreaComponent;
        // selectionStart and selectionEnd are undefined by default.
        // in case the cursor has been set manually, both selectionStart and selectionEnd will be numeric
        if (isNumber(textAreaElement.selectionStart)) {
            // if selectionStart is numeric, concatenate the following 3:
            // 1) beginning to selectionStart
            // 2) new string to be inserted
            // 3) selectionEnd to the end of string
            this.optionValue.expression = this.optionValue.expression.substring(0, textAreaElement.selectionStart)
                .concat(this.shortcutsEntry.get(event.target.label))
                .concat(this.optionValue.expression.substring(textAreaElement.selectionEnd, this.optionValue.expression.length));
            // update the start and end position to point to the end of the expression
            textAreaElement.selectionStart = this.optionValue.expression.length;
            textAreaElement.selectionEnd = textAreaElement.selectionStart;
        } else {
            this.optionValue.expression = this.optionValue.expression.concat(this.shortcutsEntry.get(event.target.label));
        }
    }

    trackFormulaShortcutClickViaTelemetry(event: any): void {
        const customCalcParameters = new CustomCalcParameters(this.widgetType, event.target.label);
        TelemetryService.track(TelemetryActionConstants.CUSTOM_CALC.FORMULA_SHORTCUT_CLICKED, customCalcParameters);
    }

    /**
     * Takes a positive integer and returns the corresponding column name similar to excel sheet.
     * i.e. 'a'...'z','aa','ab'...'az'
     */
    getMeasureAlias(num: number, measureAliasList: string[]): string {
        let colNum = num + 1;
        return this.isReserveWord(colNum, measureAliasList);
    }

    isReserveWord(num: number, measureAliasList: string[]) {
        let aliasName = this.generateAlias(num);
        if (CustomCalculationConstants.Reserved_WORDS.includes(aliasName) || measureAliasList.includes(aliasName)) {
            aliasName = this.isReserveWord(num + 1, measureAliasList);
        }
        return aliasName;
    }

    generateAlias(index: number): string {
        let aliasName = '';
        for (let a = 1, b = 26; (index -= a) >= 0; a = b, b *= 26) {
            aliasName = String.fromCharCode(((index % b) / a) + 97) + aliasName;
        }
        return aliasName;
    }

    /**
     * Sets isOpen boolean to true
     */
    openColumnMeasuresModel(): void {
        this.showColumnMeasures = true;
    }

    /**
     * Resets isOpen boolean and updates column measures
     */
    onCloseOfColumnMeasuresModal(columnSet: ColumnSet | undefined): void {
        this.showColumnMeasures = false;
        if (columnSet instanceof ColumnSet) {
            this.columnMeasures = columnSet.columns;
            this.addTitleToDeserializeColumns(this.columnMeasures);
            this.prepareMeasureDisplayContent(this.columnMeasures, true);
            this.expressionUpdated.emit(this.optionValue);
        }
    }
}
