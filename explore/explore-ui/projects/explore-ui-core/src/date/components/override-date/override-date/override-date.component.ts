import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {cloneDeep, map} from 'lodash';
import {AuxCheckboxGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {SubscribableComponent} from '../../../../core/components/subscribable.component';
import {ExploreCheckbox} from '../../../../ui/models/explore-checkbox.model';
import {CoreDefinitionStore} from '../../../../definition/core-definition.store';
import {CoreWidgetConfigStore} from '../../../../widget-config/core-widget-config.store';
import {WidgetConfigType} from '../../../../widget-config/enums/widget-config-type.enum';
import {OverrideDateConstants} from '../../../constants';
import {DateValue} from '../../../models/date-value/date-value.model';
import {OverrideDate} from '../../../../definition/models/override-date/override-date.model';
import {CompareToCurrentDateSettings} from '../../../models/override-date-settings/compare-to-current-date-settings.model';
import {OverrideDateSettings} from '../../../models/override-date-settings/override-date-settings.model';
import {DateStore} from '../../../stores';
import {CalendarDateUtils} from '../../../utils';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'explore-core-override-date',
    templateUrl: './override-date.component.html',
    styleUrls: ['./override-date.component.scss']
})
export class OverrideDateComponent extends SubscribableComponent implements OnInit {
    @Input() overrideDateSettings: OverrideDateSettings;
    @Input() compareToCurrentDateSettings: CompareToCurrentDateSettings;
    @Input() canHaveMultipleOverrideDates: boolean;
    @Input() overrideDateSelectionSubject$: BehaviorSubject<boolean>;

    @Output() customDateChange = new EventEmitter<string>();

    /**
     * Supported override dates
     */
    supportedOverrideDates: OverrideDate[];
    availableOverrideDates: ExploreCheckbox[] = [];

    customOverrideDate: DateValue;
    isFBAPieChart: boolean;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.supportedOverrideDates = cloneDeep(CoreDefinitionStore.overrideDateType);
        this.initializeSupportedOverrideDateOptions();

        this.initializeCustomOverrideDate();
        this.isFBAPieChart = CoreWidgetConfigStore.getCurrentWidgetConfigType() === WidgetConfigType.FACTOR_GRAPHING_PIE_CHART;
    }

    /**
     * Initializes the custom override date object from the customDateString
     */
    initializeCustomOverrideDate(): void {
        let customDate: DateValue;
        const currentPortfolioDate: DateValue = DateStore.getCurrentDate();
        const customOverrideDate: string = this.overrideDateSettings.customOverrideDate;
        if (!customOverrideDate) {
            // If there is no custom override date, just create a date object from the current portfolio
            customDate = new DateValue(currentPortfolioDate);
        } else {
            customDate = CalendarDateUtils.isRelativeDate(customOverrideDate) ? DateValue.newRelativeDate(customOverrideDate) : DateValue.newDate(customOverrideDate);
        }
        customDate.calCode = currentPortfolioDate.calCode;
        this.customOverrideDate = customDate;
    }

    setCustomOverrideDate(dateObject: DateValue): void {
        this.customOverrideDate = dateObject;
        this.overrideDateSettings.customOverrideDate = dateObject.dateString ? dateObject.dateStringValue : dateObject.date;
        this.customDateChange.emit(this.overrideDateSettings.customOverrideDate);
    }

    /**
     * Returns boolean to disable date picker
     */
    isDatePickerDisabled(): boolean {
        return this.overrideDateSettings.overrideDateTypes.indexOf(OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CUSTOM) === -1;
    }

    initializeSupportedOverrideDateOptions(): void {
        this.availableOverrideDates = map(this.supportedOverrideDates, (overrideDate: OverrideDate) => {
            return new ExploreCheckbox(overrideDate.getDisplayName(), this.overrideDateSettings.overrideDateTypes.includes(overrideDate.value), false);
        });
    }

    /**
     * Event handler for onCheckboxGroupChanged for override dates
     */
    onOverrideDateOptionGroupChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>): void {
        if (!event) {
            return;
        }

        // If multiple override dates are not allowed un select previously selected date before making a new selection
        if (!this.canHaveMultipleOverrideDates && this.overrideDateSettings.overrideDateTypes.length > 0) {
            const previouslySelectedOverideDate = this.supportedOverrideDates.filter(overrideDate => overrideDate.value === this.overrideDateSettings.overrideDateTypes[0])[0].getDisplayName();
            this.availableOverrideDates.filter(overrideDate => overrideDate.label === previouslySelectedOverideDate)[0].checked = false;
        }
        this.changeDetectorRef.markForCheck();

        // Empty out the array without losing the reference.
        this.overrideDateSettings.overrideDateTypes.splice(0, this.overrideDateSettings.overrideDateTypes.length);
        // event.detail.value will return an array of all the ExploreCheckbox objects
        // Each will have a property of checked
        // We will loop through all the ones that are checked, map them to the corresponding OverrideDate
        // and return the 'value' field like 'PRIOR_DAY'
        this.overrideDateSettings.overrideDateTypes.push(...this.supportedOverrideDates
            .filter(overrideDate =>
                event.detail.value
                    .filter(value => value.checked)
                    .map(value => value.label)
                    .map(value => {
                        if (value === OverrideDateConstants.CUSTOM_DATE_LABEL) {
                            this.setCustomOverrideDate(this.customOverrideDate);
                        }
                        return value;
                    })
                    .indexOf(overrideDate.getDisplayName()) !== -1)
            .map(overrideDate => overrideDate.value));
        // overrideDateSelectionSubject value true invokes (to enable/disable radio button of Calculate relative to Current based on overrideDate selection)
        this.overrideDateSelectionSubject$.next(true);
    }
}
