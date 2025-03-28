import {isNil, map} from 'lodash';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {OverrideDateConstants} from '@blk/explore-ui-core';

@Component({
    selector: 'explore-date-vary-options',
    templateUrl: './date-vary-options.component.html',
    styleUrls: ['./date-vary-options.component.scss']
})
export class DateVaryOptionsComponent implements OnInit {
    @Input()
    optionValue: any;

    dateVaryOptions: AuxRadioInterface[];

    @Output()
    dateVaryOptionChanged = new EventEmitter<null>();

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.initializeDefaultDateType();
        this.initializeDateVaryOptions();
    }


    initializeDefaultDateType(): void {
        // catering old favorite with dateType wrongly set to ECONOMY -> defaulting to vary both
        if (isNil(this.optionValue.dateType) || this.optionValue.dateType === OverrideDateConstants.ECONOMY) {
            this.optionValue.dateType = OverrideDateConstants.VARY_BOTH;
        }
    }

    /**
     * Initialize date vary options
     */
    initializeDateVaryOptions(): void {
        this.dateVaryOptions = map(OverrideDateConstants.DATE_VARY_TYPES, (overrideDateType: any) => {
            return {
                label: overrideDateType[1],
                eventData: overrideDateType[0],
                checked: overrideDateType[0] === this.optionValue.dateType
            };
        });
    }

    onDateVaryOptionChanged(option: AuxRadioInterface): void {
        this.optionValue.dateType = option.eventData;

        this.dateVaryOptionChanged.emit();
    }
}
