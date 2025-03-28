import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Calendar, CalendarDateUtils, CoreDefinitionStore, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';

/**
 * Component used to select holiday calendar
 */
@Component({
    selector: 'app-calendar-picker',
    templateUrl: './calendar-picker.component.html'
})
export class CalendarPickerComponent implements OnInit {

    @Input() calCode: string;

    @Input() label: string;

    @Output() calendarChanged = new EventEmitter<Calendar>();

    calendars: Calendar[];

    selectedCalendar: Calendar;

    auxCalendarListData: ExploreSelectOptionGroup[];

    constructor() {
        this.calendars = CoreDefinitionStore.calendars;
    }

    ngOnInit() {
        this.setSelectedCalendar(this.calCode);
        this.setAuxCalendarListData();
    }

    /**
     * On calendar changed
     */
    onCalendarChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const selectedCalCode = (event.detail.value as AuxSelectOption).value;
        this.setSelectedCalendar(selectedCalCode);
    }

    /**
     * Set selected calendar object
     * @param calCode
     */
    private setSelectedCalendar(calCode: string) {
        this.selectedCalendar = CalendarDateUtils.getCalendarByCode(this.calendars, calCode);
        this.calendarChanged.emit(this.selectedCalendar);
    }

    /**
     * Set aux calendar list
     */
    private setAuxCalendarListData(): void {
        this.auxCalendarListData = [new ExploreSelectOptionGroup()];
        for (const calendar of this.calendars) {
            this.auxCalendarListData[0].values.push(new ExploreSelectOption(calendar.calendarName, calendar.calendarCode, calendar.calendarCode === this.calCode));
        }
    }

}
