import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {ExpostReturnSettingsComponent} from './expost-return-settings/expost-return-settings.component';
import {ExpostTimePeriodSettingsComponent} from './expost-time-period-settings/expost-time-period-settings.component';
import {ExpostTimeSeriesSettingsComponent} from './expost-time-series-settings/expost-time-series-settings.component';

@NgModule({
    declarations: [ExpostTimePeriodSettingsComponent, ExpostTimeSeriesSettingsComponent, ExpostReturnSettingsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule
    ],
    exports: [ExploreUiCoreModule, ExpostTimeSeriesSettingsComponent, ExpostReturnSettingsComponent]
})
export class ExpostModule {
}
