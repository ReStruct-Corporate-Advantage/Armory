import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {DatePickerComponent} from './components/date-picker/date-picker.component';
import {DateRangePickerComponent} from './components/date-picker/date-range-picker/date-range-picker.component';
import {CompareToCurrentComponent} from './components/override-date/compare-to-current/compare-to-current.component';
import {MultiOverrideDateComponent} from './components/override-date/multi-override-date/multi-override-date.component';
import {OverrideDateComponent} from './components/override-date/override-date/override-date.component';
import {DateService} from './services/date.service';

@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
    ],
    declarations: [
        CompareToCurrentComponent,
        OverrideDateComponent,
        MultiOverrideDateComponent,
        DatePickerComponent,
        DateRangePickerComponent,
    ],
    exports: [
        CompareToCurrentComponent,
        OverrideDateComponent,
        MultiOverrideDateComponent,
        DatePickerComponent,
        DateRangePickerComponent
    ],
    providers: [
        DateService
    ]
})
export class DateModule {
}
