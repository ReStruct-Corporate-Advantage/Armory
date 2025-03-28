import {Component, Input, OnInit} from '@angular/core';
import {AdditionalPerformanceSettings, CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup, KrdBucketDetails, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {ColumnOptionConstants} from '@blk/explore-ui-column-option';

/**
 * Component for additional performance Settings
 */
@Component({
    selector: 'app-additional-performance-settings',
    templateUrl: './additional-performance-settings.component.html',
    styleUrls: ['./additional-performance-settings.component.scss']
})
export class AdditionalPerformanceSettingsComponent implements OnInit {

    @Input() showAdditionalSettingsAttributes: number;
    @Input() additionalSettings: AdditionalPerformanceSettings;

    showAsReported = true;
    showShowSummary = true;
    showAggBMOnlyRetSec = true;
    showRemBMOnlyRetBucket = true;
    showCollapseClosedPositions = true;
    showCustomPivotPoint = true;

    isTemplateExpanded = true;
    isShowSummaryEnabled: boolean;
    isAsReportedEnabled: boolean;
    availableCustomPivotPointsData: ExploreSelectOptionGroup[] = [new ExploreSelectOptionGroup()];
    returnTypeDisplayOptions: AuxRadioInterface[];

    isNetGrossReturnsEnabled = false;

    ngOnInit() {
        this.showAsReported = this.showAttribute(1<<0);
        this.showShowSummary = this.showAttribute(1<<1);
        this.showAggBMOnlyRetSec = this.showAttribute(1<<2);
        this.showRemBMOnlyRetBucket = this.showAttribute(1<<3);
        this.showCollapseClosedPositions = this.showAttribute(1<<4);
        this.showCustomPivotPoint = this.showAttribute(1<<5);

        // Only one of isReported amd showSummary can be checked. These flags help disabling the checkbox for AsReported and showSummary when one of them is checked
        this.isShowSummaryEnabled = this.additionalSettings.asReported ? !this.additionalSettings.asReported : true;
        this.isAsReportedEnabled = this.additionalSettings.showSummary ? !this.additionalSettings.showSummary : true;

        const availableCustomPivotPoints: KrdBucketDetails[] = [];
        CoreDefinitionStore.krdBucketDetail.forEach((krdBucketDetail) => {
            availableCustomPivotPoints.push(krdBucketDetail);
        });

        this.availableCustomPivotPointsData[0].values = this.setDisplayDataForSelectBox(availableCustomPivotPoints);

        this.isNetGrossReturnsEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_PRAADA_NET_GROSS_RETURNS);
        this.returnTypeDisplayOptions = [
            {label: 'Gross returns', checked: !this.additionalSettings?.isNetReturn, disabled: false},
            {label: 'Net returns', checked: !!this.additionalSettings?.isNetReturn, disabled: false}
        ];
    }

    /**
     * Show attribute based on attribute bitmask and show attributes mask provided.
     */
    private showAttribute(attributeBitmask): boolean {
        if (!this.showAdditionalSettingsAttributes) {
            return true;
        }

        return (this.showAdditionalSettingsAttributes & attributeBitmask) > 0;
    }

    /**
     * Set display data for select box
     */
    setDisplayDataForSelectBox(items: KrdBucketDetails[]): ExploreSelectOption[] {
        const customPivotPointsSelectOptions =  items.map(item => {
            return new ExploreSelectOption(item.name, item.value, this.additionalSettings.customPivotPoint === item.value);
        });
        // If there is no customPivotPoint selected then make 10 year by default
        // See this ticket for the detail - https://dev.azure.com/1A4D/Explore/_workitems/edit/1633270/
        if (this.showCustomPivotPoint && !this.additionalSettings.customPivotPoint) {
            const tenYearCustomPivotPoint = customPivotPointsSelectOptions.find(customPivotPointSelectOption => customPivotPointSelectOption.value === ColumnOptionConstants.TEN_YEAR);
            if (tenYearCustomPivotPoint) {
                tenYearCustomPivotPoint.isSelected = true;
                this.additionalSettings.customPivotPoint = tenYearCustomPivotPoint.value;
            }
        }
        return customPivotPointsSelectOptions;
    }

    /**
     * Set expanded state of accordion
     */
    onAccordionChanged(): void {
        this.isTemplateExpanded = !this.isTemplateExpanded;
    }

    /**
     * Sets asReported
     */
    setAsReported(value: boolean): void {
        this.additionalSettings.asReported = value;
        this.isShowSummaryEnabled = !value;
    }

    /**
     * Sets showSummary
     */
    setShowSummary(value: boolean): void {
        this.additionalSettings.showSummary = value;
        // When this is checked disable the asReported checkbox
        this.isAsReportedEnabled = !value;
    }

    /**
     * Sets aggregateBMOnlyReturnSecurities
     */
    setAggregateBMOnlyReturnSecurities(value: boolean): void {
        this.additionalSettings.aggregateBMOnlyReturnSecurities = value;
    }

    /**
     * Sets removeBMOnlyReturnBucket
     */
    setRemoveBMOnlyReturnBucket(value: boolean): void {
        this.additionalSettings.removeBMOnlyReturnBucket = value;
    }

    /**
     * Sets collapseClosedPositions
     */
    setCollapseClosedPositions(value: boolean): void {
        this.additionalSettings.collapseClosedPositions = value;
    }

    /**
     * Sets customPivotPoint
     */
    setCustomPivot(value: string): void {
        this.additionalSettings.customPivotPoint = value;
    }

    /**
     * Update the state of Gross/Net Return radio
     */
    updateNetReturn() {
        this.additionalSettings.isNetReturn = this.returnTypeDisplayOptions[1].checked;
    }
}
