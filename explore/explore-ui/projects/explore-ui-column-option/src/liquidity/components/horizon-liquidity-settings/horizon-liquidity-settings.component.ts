import {Component, Inject, OnInit, Optional} from '@angular/core';
import {HorizonLiquiditySettings} from '../../models/horizon-liquidity-settings/horizon-liquidity-settings.model';
import {isNil} from 'lodash';
import {LiquidityConstants} from '../../liquidity.constants';
import {TimeHorizonLiquiditySettings} from '../../models/horizon-liquidity-settings/time-horizon-liquidity-settings.model';
import {LiquidityHorizonCalendarDay} from '../../enums/liquidity-horizon-calendar-day.enum';
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ExploreRadioButton, NOTIFICATION_SERVICE_TOKEN, NotificationServiceInterface} from '@blk/explore-ui-core';
import {BaseLiquiditySettingsComponent} from '../base-liquidity-settings.component';

/**
 * Horizon liquidity Settings for ESMA column in liquidity Settings
 */
@Component({
    selector: 'explore-column-option-horizon-liquidity-settings',
    templateUrl: './horizon-liquidity-settings.component.html',
    styleUrls: ['./horizon-liquidity-settings.component.scss']
})
export class HorizonLiquiditySettingsComponent extends BaseLiquiditySettingsComponent<HorizonLiquiditySettings> implements OnInit {

    isShowTimeHorizonOptions: boolean;
    isShowMinDaysTimeHorizonOption: boolean;

    calendarDaysOptions: ExploreRadioButton[];

    /**
     * Constructor
     * @param notificationService
     */
    constructor(@Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) public notificationService: NotificationServiceInterface) {
        super();
    }

    /**
     * Initialize all required fields
     */
    ngOnInit(): void {
        this.isShowTimeHorizonOptions = this.optionAttributes.get(LiquidityConstants.HORIZON_OPTIONS);
        this.setShowMinDaysTimeHorizonOption();

        this.calendarDaysOptions = LiquidityHorizonCalendarDay.values().map(calendarDay =>
            new ExploreRadioButton(LiquidityHorizonCalendarDay.displayName(calendarDay), this.underlyingLiquiditySettings.calendarDays === calendarDay, false, calendarDay)
        );
    }

    /**
     * On calendar day changed
     * @param event
     */
    onCalendarDayChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.calendarDays = event.detail.value.eventData;
        this.underlyingLiquiditySettings.timeHorizons = LiquidityHorizonCalendarDay.getTimeHorizonsByCalendarDay(this.underlyingLiquiditySettings.calendarDays);

        this.setShowMinDaysTimeHorizonOption();
    }

    /**
     * On numberic min day changed
     * @param event
     * @param timeHorizon
     */
    onMinDaysChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>, timeHorizon: TimeHorizonLiquiditySettings): void {
        if (isNil(event)) {
            return;
        }

        timeHorizon.minDays = Number(event.detail.value);
        this.setTimeHorizonTitle(timeHorizon);
    }

    /**
     * On numeric max day changed
     * @param event
     * @param timeHorizon
     */
    onMaxDaysChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>, timeHorizon: TimeHorizonLiquiditySettings): void {
        if (isNil(event)) {
            return;
        }

        timeHorizon.maxDays = Number(event.detail.value);
        this.setTimeHorizonTitle(timeHorizon);
    }

    /**
     * Delete selected timeHorizon from an array of timeHorizons
     * @param index
     */
    deleteSelectedTimeHorizon(index: number): void {
        if (this.notificationService && this.underlyingLiquiditySettings.timeHorizons.length === 1) {
            this.notificationService.warning('Cannot delete all entries.');
            return;
        }

        this.underlyingLiquiditySettings.timeHorizons.splice(index, 1);
    }

    /**
     * Add new time horizon row to timeHorizons with minDays & maxDays as 0,1 respectively
     */
    addTimeHorizon(): void {
        this.underlyingLiquiditySettings.timeHorizons.push(new TimeHorizonLiquiditySettings(0, 1));
    }

    /**
     * On time horizon title changed
     * @param event
     * @param timeHorizon
     */
    onTimeHorizonTitleChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>, timeHorizon: TimeHorizonLiquiditySettings): void {
        if (isNil(event)) {
            return;
        }

        timeHorizon.title = event.detail.value;
    }

    /**
     * Set show min days time horizon option
     */
    private setShowMinDaysTimeHorizonOption(): void {
        this.isShowMinDaysTimeHorizonOption = this.isShowTimeHorizonOptions && this.underlyingLiquiditySettings.calendarDays === LiquidityHorizonCalendarDay.DISCRETE;
    }

    /**
     * Set Time Horizon title for every array of timeHorizons
     * @param timeHorizon
     */
    private setTimeHorizonTitle(timeHorizon: TimeHorizonLiquiditySettings) {
        if (!TimeHorizonLiquiditySettings.TITLE_REGEXP.test(timeHorizon.title)) {
            return;
        }

        timeHorizon.title = timeHorizon.getDefaultTitle();
    }
}
