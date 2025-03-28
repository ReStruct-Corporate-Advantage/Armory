import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {isNil, map} from 'lodash';
import {OverrideDateConstants} from '@blk/explore-ui-core';
import {DateVaryOptionsComponent} from './date-vary-options.component';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

@Component({
    selector: 'explore-fba-date-vary-options',
    templateUrl: './fba-date-vary-options.component.html',
    styleUrls: ['./date-vary-options.component.scss']
})
export class FbaDateVaryOptionsComponent extends DateVaryOptionsComponent implements OnInit {

    /**
     * Flag indicating the column properties (including whether or not column depends on economy and exposure dates)
     */
    @Input()
    riskColumnFlags: string[];

    @Output()
    dateVaryOptionChanged = new EventEmitter<null>();

    initializeDefaultDateType(): void {
        let defaultDateType: string;

        const savedDateType = this.optionValue.dateType;
        if (!isNil(savedDateType) && !this.isDateTypeDisabled(savedDateType)) {
            defaultDateType = savedDateType;
        } else if (!this.isDateTypeDisabled(OverrideDateConstants.VARY_BOTH)) {
            defaultDateType = OverrideDateConstants.VARY_BOTH;
        } else {
            defaultDateType = (this.riskColumnFlags?.indexOf(OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_EXPOSURE) < 0) ? OverrideDateConstants.FBA_DATE_VARY_TYPES.ECONOMY[0] : OverrideDateConstants.FBA_DATE_VARY_TYPES.EXPOSURE[0];
        }

        this.optionValue.dateType = defaultDateType;
    }

    /**
     * Initialize date vary options
     */
    initializeDateVaryOptions(): void {
        this.dateVaryOptions = map(OverrideDateConstants.FBA_DATE_VARY_TYPES, (overrideDateType: any) => {
            return {
                label: overrideDateType[1],
                eventData: overrideDateType[0],
                checked: overrideDateType[0] === this.optionValue.dateType
            };
        });
    }

    /**
     * Returns boolean based on if an override date type is disabled
     */
    isDateTypeDisabled(value: string): boolean {
        if (!this.riskColumnFlags) {
            return true;
        }
        if (value === OverrideDateConstants.FBA_DATE_VARY_TYPES.EXPOSURE[0]) {
            return (this.riskColumnFlags.indexOf(OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_EXPOSURE) < 0);
        } else if (value === OverrideDateConstants.FBA_DATE_VARY_TYPES.ECONOMY[0]) {
            return (this.riskColumnFlags.indexOf(OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_ECONOMY) < 0);
        } else {
            // If it's not 'EXPOSURE' or 'ECONOMY', then it's 'BOTH'. Check for 'DEPENDS_ON_ECONOMY' then 'DEPENDS_ON_EXPOSURE'
            return (this.riskColumnFlags.indexOf(OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_ECONOMY) < 0 || this.riskColumnFlags.indexOf(OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_EXPOSURE) < 0);
        }
    }

    /**
     * Method invoked when user toggles between overriding economy/exposure/both dates
     */
    onDateVaryOptionChanged(option: AuxRadioInterface): void {
        this.optionValue.dateType = option.eventData;

        // Attribution is available with 'Compare to Current' only in case of overriding both dates
        if (this.optionValue.dateType === OverrideDateConstants.VARY_BOTH) {
            return;
        }

        this.dateVaryOptionChanged.emit();
    }
}
