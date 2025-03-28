import {StyleAnalysisColumnOption} from '../../../models/column-option/style-analysis-column-option.model';
import {Component, OnInit} from '@angular/core';
import {
    ColumnConfig,
    ColumnOptionMetaDataInterface,
    CoreAppUtils,
    CoreColumnUtils,
    CoreWidgetConfigStore,
    UserMetaDataUtils
} from '@blk/explore-ui-core';
import {isEmpty, isNil} from 'lodash';
import {ColumnSet} from '../../../models/column-set/column-set.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {
    AuxCheckboxChangedDetailInterface,
    AuxRadioInterface,
    AuxTextInputBlurDetailInterface,
    Validator
} from '@blk/aladdin-angular-components';
import {StyleMeasureColumnOptionModel} from '../../../models/column-option/style-measure-column-option.model';
import {ColumnOptionService} from '../../../services/column-option.service';
import {ColumnOptionResponse} from '../../../interfaces';
import {ColumnOptionConstants, SubtotallerConstants} from '../../../constants';
import {LibColumnUtils} from '../../../utils';

@Component({
    selector: 'explore-style-analysis-column-option',
    templateUrl: './style-analysis-column-option.component.html',
    styleUrls: ['./style-analysis-column-option.component.scss']
})
/**
 * Component class for Style Analysis column option.
 */
export class StyleAnalysisColumnOptionComponent extends BaseColumnOptionComponent<StyleAnalysisColumnOption> implements OnInit {

    /** Option key for this column option component */
    static OPTION_KEY = StyleAnalysisColumnOption.CONFIG_TYPE;
    docUrl =  '/literature/quick-start-guides/style-analysis-user-guide.pdf';

    validator: Validator[];

    selectedStyleMeasureSummary: any[];
    showEditColumnMeasuresModal = false;
    columnMeasures: ColumnConfig[];
    showActiveAdjustExposureCheckBox= true;
    protected getOptionValueConfigType(): string {
        return StyleAnalysisColumnOption.CONFIG_TYPE;
    }

    /**
     * constructor
     */
    constructor(private columnOptionService: ColumnOptionService) {
        super();
    }

    /**
     * Initialize the component fields
     */
    initializeComponent(): void {
        if (CoreAppUtils.isExternalBENClient()) {
            const userOrg = UserMetaDataUtils.getUserPerm('userOrg');
            this.docUrl = `${userOrg}/risk` + this.docUrl;
        } else {
            this.docUrl = 'acs' + this.docUrl;
        }
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);
        this.restrictedColumnOptions = widgetConfig?.styleAnalysis?.restrictedColumnOptions;
        const scopeColumnOption = widgetConfig?.styleAnalysis?.measureNodeColumnOption;
        if (scopeColumnOption) {
            this.columnOptionsToAdd = [];
            this.columnOptionsToAdd.push(scopeColumnOption);
        }
        LibColumnUtils.updateMeasureMapping(this.column.columnTag, this.optionValue, widgetConfig);
        this.columnMeasures = Object.values(this.optionValue.measureMapping);
        this.addTitleToDeserializeColumns(this.columnMeasures);
        this.prepareMeasureDisplayContent(this.columnMeasures);
        this.validator = [{
            validate: (value: number) => {
                return isNil(value) || !isNaN(value);
            },
            errorMessage: 'Invalid input'
        }];

        if(isNil(this.optionValue.adjustActiveExposure)){
            const optionAttributes = this.option.columnOptionAttributes[0];
            const attributeValue = optionAttributes.values?.find((attribute: any) => attribute.label === 'isContributionColumn');
            //Show the checkbox only if the style column is standalone and not contribution
            if(!attributeValue?.value){
                this.optionValue.adjustActiveExposure = true;
            }else{
                //Hide the checkbox if the style column is contribution
                this.showActiveAdjustExposureCheckBox = false;
            }
        }
    }

    /**
     * Reset Column title
     */
    private addTitleToDeserializeColumns(columnMeasures: ColumnConfig[]): void {
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
    prepareMeasureDisplayContent(measures: ColumnConfig[]): void {
        this.optionValue.measureMapping = {};
        this.selectedStyleMeasureSummary = isEmpty(measures) ? [] : this.getSelectedStyleMeasureSummary(measures);
    }

    private getSelectedStyleMeasureSummary(measures: ColumnConfig[]) {
        const styleMeasures: Record<string, StyleMeasureColumnOptionModel> = {};
        const summary = this.getStyleSummary(measures, styleMeasures);
        this.optionValue.styleMeasureMapping = styleMeasures;
        return summary;
    }

    private getStyleSummary(measures: ColumnConfig[], styleMeasures: Record<string, StyleMeasureColumnOptionModel>) {
        return measures
            .map((measure) => {
                const measureAlias: string = measure.columnKey;
                let style = this.optionValue.styleMeasureMapping[measureAlias];
                if (isNil(style)) {
                    style = new StyleMeasureColumnOptionModel();
                    style.weight = Number((1 / this.columnMeasures.length).toFixed(2));
                    this.columnOptionService.fetchColumnOptions$([{colTag: measure.columnTag, use: measure.positionColumnType}])
                        .subscribe((response: ColumnOptionResponse[]) => {
                            this.populateStyleOption(response, style);
                        });
                }
                styleMeasures[measureAlias] = style;
                this.optionValue.measureMapping[measureAlias] = measure;
                return {
                    title: measure.title,
                    min: style.min,
                    max: style.max,
                    weight: style.weight,
                    isNormal: style.isNormal,
                    alias: measureAlias
                };
            });
    }

    private populateStyleOption(response: ColumnOptionResponse[], style: StyleMeasureColumnOptionModel) {
        const columnOptions: ColumnOptionMetaDataInterface[] = response[0].options;
        const aggregationOption = columnOptions.find((optionVal: any) => {
            return optionVal.columnOptionConfigType === ColumnOptionConstants.AGGREGATION || optionVal.columnOptionConfigType === ColumnOptionConstants.CUSTOM_AGGREGATION;
        });
        const defaultAggregationOptionAttribute = aggregationOption.columnOptionAttributes.find((optionAttr: any) => {
            return optionAttr.key === ColumnOptionConstants.AGGREGATION_TYPE || optionAttr.key === ColumnOptionConstants.SUBTOTAL_TYPE;
        });
        const isHarmonic = (defaultAggregationOptionAttribute.defaultValue['label'] === SubtotallerConstants.HARMONIC_MEAN.name
                           && defaultAggregationOptionAttribute.defaultValue['value'] === SubtotallerConstants.HARMONIC_MEAN.id)
                           || (defaultAggregationOptionAttribute.defaultValue['label'] === SubtotallerConstants.WEIGHTED_AVERAGE_HARMONIC_MEAN.name
                           && defaultAggregationOptionAttribute.defaultValue['value'] === SubtotallerConstants.WEIGHTED_AVERAGE_HARMONIC_MEAN.id);
        style.isNormal = !isHarmonic;
        if (aggregationOption.columnOptionConfigType === ColumnOptionConstants.CUSTOM_AGGREGATION) {
            const minAggregationOptionAttribute = aggregationOption.columnOptionAttributes.find((optionAttr: any) => {
                return optionAttr.key === ColumnOptionConstants.MIN_AGG_VALUE;
            });
            style.min = minAggregationOptionAttribute.defaultValue['value'];

            const maxAggregationOptionAttribute = aggregationOption.columnOptionAttributes.find((optionAttr: any) => {
                return optionAttr.key === ColumnOptionConstants.MAX_AGG_VALUE;
            });
            style.max = maxAggregationOptionAttribute.defaultValue['value'];
        } else {
            style.min = null;
            style.max = null;
        }
    }

    /**
     * Sets isOpen boolean to true
     */
    openColumnMeasuresModel(): void {
        this.showEditColumnMeasuresModal = true;
    }

    /**
     * Resets isOpen boolean and updates column measures
     */
    onCloseOfColumnMeasuresModal(columnSet: ColumnSet | undefined): void {
        this.showEditColumnMeasuresModal = false;
        if (columnSet instanceof ColumnSet) {
            this.columnMeasures = columnSet.columns;
            this.addTitleToDeserializeColumns(this.columnMeasures);
            this.prepareMeasureDisplayContent(this.columnMeasures);
        }
    }

    onNormalInverseOptionsChanged(alias: string, option: AuxRadioInterface): void {
        const styleOption: StyleMeasureColumnOptionModel = this.optionValue.styleMeasureMapping[alias];
        styleOption.isNormal = option.eventData === 'Normal';
    }

    onMinChanged(alias: string, event: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        const styleOption: StyleMeasureColumnOptionModel = this.optionValue.styleMeasureMapping[alias];
        if((event.detail.srcEvent.target as HTMLAuxTextInputElement).value){
            styleOption.min = Number((event.detail.srcEvent.target as HTMLAuxTextInputElement).value);
        }else{
            styleOption.min = undefined;
        }
    }

    onMaxChanged(alias: string, event: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        const styleOption: StyleMeasureColumnOptionModel = this.optionValue.styleMeasureMapping[alias];
        if((event.detail.srcEvent.target as HTMLAuxTextInputElement).value){
            styleOption.max = Number((event.detail.srcEvent.target as HTMLAuxTextInputElement).value);
        }else{
            styleOption.max = undefined;
        }
    }

    onWeightValueChanged(alias: string, ev: CustomEvent<AuxTextInputBlurDetailInterface>) {
        const value = (ev.detail.srcEvent.target as HTMLAuxTextInputElement).value;
        const styleOption: StyleMeasureColumnOptionModel = this.optionValue.styleMeasureMapping[alias];
        styleOption.weight = Number(value);
    }

    isShownMeasureSelected(): boolean {
        return this.optionValue.showMeasures;
    }

    onShowMeasureCheckboxChange(value: boolean) {
        this.optionValue.showMeasures = value;
    }

    /**
     * Check if the column option is valid
     */
    isValid(): boolean {
        return true;
    }

    isMeasureAdded(): boolean {
        return this.selectedStyleMeasureSummary && this.selectedStyleMeasureSummary.length > 0;
    }

    getNormalInverseOptions(alias: string): AuxRadioInterface[] {
        const isNormal = this.optionValue.styleMeasureMapping[alias].isNormal;
        return [{
            label: 'Normal',
            eventData: 'Normal',
            checked: isNormal
        },
            {
                label: 'Inverse',
                eventData: 'Inverse',
                checked: !isNormal
            }];
    }

    onAdjustActiveExposureChange(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.optionValue.adjustActiveExposure = event.detail.value.checked;
    }
}
