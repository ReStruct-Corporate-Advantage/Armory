import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {cloneDeep, map} from 'lodash';
import {ExploreSelectOptionGroup} from '../../../../ui/models/explore-select-option-group.model';
import {CoreDefinitionStore} from '../../../../definition/core-definition.store';
import {OverrideDateConstants} from '../../../constants';
import {CompareToCurrent} from '../../../../definition/models/override-date/compare-to-current.model';
import {CompareToCurrentDateSettings} from '../../../models/override-date-settings/compare-to-current-date-settings.model';
import {MultiOverrideDateSettings} from '../../../models/override-date-settings/multi-override-date-settings.model';
import {OverrideDateSettings} from '../../../models/override-date-settings/override-date-settings.model';
import {BehaviorSubject} from 'rxjs';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

@Component({
    selector: 'explore-core-compare-to-current',
    templateUrl: './compare-to-current.component.html',
    styleUrls: ['./compare-to-current.component.scss']
})
export class CompareToCurrentComponent implements OnChanges, OnInit {
    @Input() overrideDateSettings: OverrideDateSettings;
    @Input() multiOverrideDateSettings: MultiOverrideDateSettings;
    @Input() compareToCurrentDateSettings: CompareToCurrentDateSettings;
    @Input() dateType: string;

    @Output() compareToCurrentChanged = new EventEmitter<string>();

    @Input() overrideDateSelectionSubject$: BehaviorSubject<boolean>;

    @Input() isDecompositionDisableAttributePresent: boolean;

    isDecompositionChecked: boolean = false;
    isDecompositionRequired: boolean = false;

    //enable decomposition checkbox when comparetToCurrentDateType is selected as comparetToCurrent or Percentage compareToCurrent
    isDecompositionEnabled: boolean = false;

    compareToCurrentDateTypes: CompareToCurrent[];
    supportedCompareToCurrentTypeOptions: AuxRadioInterface[];

    constructor() {
        this.compareToCurrentDateTypes = cloneDeep(CoreDefinitionStore.compareToCurrentDataType);
    }

    ngOnInit(): void {
        this.updateOnInitializeCompareToCurrentValue();

        // If the user makes checkbox selection changes of overrideDatetypes then overrideDateSelectionSubject$ is updated to validate
       //to enable/disable the radio button of calcuate relative to current
        this.overrideDateSelectionSubject$.subscribe(res => {
            if (res) {
                this.createCompareToCurrentDateTypeOptions();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dateType || changes.compareToCurrentDateSettings || changes.multiOverrideDateSettings) {
            // If the user makes changes to the dateType or switches between the date override, re-create the options
            // This will also be called upon initialization, so we don't ngOnInit
            this.isDecompositionRequired = this.dateType === OverrideDateConstants.VARY_BOTH;
            this.createCompareToCurrentDateTypeOptions();
        }
    }

    /**
     * Creates the options for the aux-select component
     */
    createCompareToCurrentDateTypeOptions(): void {
        // Create an ExploreSelectOption Group that we will populate
        const compareToCurrentDateTypeOptions = new ExploreSelectOptionGroup();
        for (const compareToCurrentDateType of this.compareToCurrentDateTypes) {
            if ((this.dateType === OverrideDateConstants.VARY_BOTH) && (compareToCurrentDateType.value === OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION || compareToCurrentDateType.value === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION)) {
                continue;
            }
            if (!(compareToCurrentDateType.value === OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION || compareToCurrentDateType.value === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION)) {
                const compareToCurrentDateTypeOption = {
                    displayValue: compareToCurrentDateType.label,
                    value: compareToCurrentDateType.value,
                    isSelected: this.compareToCurrentDateSettings.compareToCurrentValue === compareToCurrentDateType.value
                };
                compareToCurrentDateTypeOptions.values.push(compareToCurrentDateTypeOption);
            }
        }
        if (!this.isCompareToCurrentApplicable()) {
            this.supportedCompareToCurrentTypeOptions = map(compareToCurrentDateTypeOptions.values, (compareToCurrent: any) => {
                return { label: compareToCurrent.displayValue, eventData: compareToCurrent.value, checked: compareToCurrent.isSelected, disabled: true }
            });
        } else {
            if (this.compareToCurrentDateSettings.compareToCurrentValue === OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION) {
                compareToCurrentDateTypeOptions.values.filter(obj => obj.value === OverrideDateConstants.COMPARE_TO_CURRENT).forEach(obj => obj.isSelected = true);
            } else if (this.compareToCurrentDateSettings.compareToCurrentValue === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION) {
                compareToCurrentDateTypeOptions.values.filter(obj => obj.value === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT).forEach(obj => obj.isSelected = true);
            }
            this.supportedCompareToCurrentTypeOptions = map(compareToCurrentDateTypeOptions.values, (compareToCurrent: any) => {
                return { label: compareToCurrent.displayValue, eventData: compareToCurrent.value, checked: compareToCurrent.isSelected, disabled: false }
            });
        }
        this.setDecompositionChecked();
    }

    /**
     * Returns true if compare to current is applicable. When no override date has been set or only current has been chosen then the compare to current is not applicable
     */
    isCompareToCurrentApplicable(): boolean {
        if (!this.compareToCurrentDateSettings.compareToCurrentValue) {
            this.setCompareToCurrentValue(OverrideDateConstants.NONE_COMPARE_TO_CURRENT);
        }
        const numberOfOverrideDateTypes = this.overrideDateSettings.overrideDateTypes.length;
        if ((numberOfOverrideDateTypes === 0 || (numberOfOverrideDateTypes === 1 && this.overrideDateSettings.overrideDateTypes.indexOf(OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT) !== -1)) && !this.multiOverrideDateSettings.multiOverrideDateTypeFrequency) {
            this.setCompareToCurrentValue(OverrideDateConstants.NONE_COMPARE_TO_CURRENT);
            return false;
        }
        return true;
    }

    /**
     * Callback when a select option is changed
     */
    onSelectionChanged(compareToCurrentTypeOption?: string): void {
        this.updateCompareToCurrentDateSettingsValue(compareToCurrentTypeOption);

        // If Compare to current has been set to something other than None,
        // then CURRENT date is not valid so remove that from override date settings model
        const currentDateIndex = this.overrideDateSettings.overrideDateTypes.indexOf(OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CURRENT);
        if (this.compareToCurrentDateSettings.compareToCurrentValue !== OverrideDateConstants.NONE_COMPARE_TO_CURRENT && currentDateIndex !== -1) {
            this.overrideDateSettings.overrideDateTypes.splice(currentDateIndex, 1);
        }
    }

    /**
     * Updates the compareToCurrentValue of the CompareToCurrentDateSettings model
     * Also programmatically updates the isSelected property of the select group (for a case when the option was selcted but not shown in the UI)
     */
    setCompareToCurrentValue(value: string): void {
        this.compareToCurrentDateSettings.compareToCurrentValue = value;
        this.supportedCompareToCurrentTypeOptions?.forEach(option => (option.checked = (option.label === value)));
        // After initialization of option 'NONE' emit the latest option selected
        this.compareToCurrentChanged.emit(value);
    }

    onSelectedDecompositon(checked: boolean): void {
        this.isDecompositionChecked = checked;
        this.updateCompareToCurrentDateSettingsValue(this.compareToCurrentDateSettings.compareToCurrentValue);
    }

    private updateCompareToCurrentDateSettingsValue(compareToCurrentTypeOption?: string): void {

        if (!this.isDecompositionChecked) {
            if (compareToCurrentTypeOption === OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION) {
                this.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.COMPARE_TO_CURRENT;
            } else if (compareToCurrentTypeOption === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION) {
                this.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT;
            }
            else if (compareToCurrentTypeOption === OverrideDateConstants.NONE_COMPARE_TO_CURRENT) {
                this.compareToCurrentDateSettings.compareToCurrentValue = compareToCurrentTypeOption;
                this.isDecompositionChecked = false;
            }
            else {
                this.compareToCurrentDateSettings.compareToCurrentValue = compareToCurrentTypeOption;
            }
        }

        if (this.isDecompositionChecked) {
            if (compareToCurrentTypeOption === OverrideDateConstants.COMPARE_TO_CURRENT) {
                this.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION;
            }
            else if (compareToCurrentTypeOption === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT) {
                this.compareToCurrentDateSettings.compareToCurrentValue = OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION;
            }
            else if (compareToCurrentTypeOption === OverrideDateConstants.NONE_COMPARE_TO_CURRENT) {
                this.compareToCurrentDateSettings.compareToCurrentValue = compareToCurrentTypeOption;
                this.isDecompositionChecked = false;
            }
            else {
                this.compareToCurrentDateSettings.compareToCurrentValue = compareToCurrentTypeOption;
            }
        }
        this.setDecompositionChecked();
        // Emit the new compareToCurrentValue
        this.compareToCurrentChanged.emit(this.compareToCurrentDateSettings.compareToCurrentValue);
    }

    private setDecompositionChecked(): void {

        const compareToCurrentValue = this.compareToCurrentDateSettings.compareToCurrentValue;

        this.isDecompositionChecked = (OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION === compareToCurrentValue || OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION === compareToCurrentValue);
        this.isDecompositionEnabled = (OverrideDateConstants.COMPARE_TO_CURRENT === compareToCurrentValue || OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT === compareToCurrentValue || this.isDecompositionChecked);
    }

    private updateOnInitializeCompareToCurrentValue(): void {
        if (this.isDecompositionDisableAttributePresent) {
            this.isDecompositionChecked = false;
            this.updateCompareToCurrentDateSettingsValue(this.compareToCurrentDateSettings.compareToCurrentValue);
        }
    }
}
