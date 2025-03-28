import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {DateModule} from '../date/date.module';
import {UiModule} from '../ui/ui.module';
import {AttributionFactorViewComponent} from './components/attribution-settings/attribution-factor-view/attribution-factor-view.component';
import {AttributionSettingsComponent} from './components/attribution-settings/attribution-settings.component';
import {TimePeriodSettingsComponent} from './models/time-period-settings/time-period-settings.component';
import { AdvancedAttributionSettingsComponent } from './components/advanced-attribution-settings/advanced-attribution-settings.component';
import {AttributionSettingsModalDialogComponent} from './components/attribution-settings/attribution-settings-modal/attribution-settings-modal-dialog.component';
import {DialogModule} from '../dialogs/dialog.module';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        UiModule,
        DateModule,
        DialogModule
    ],
    declarations: [
        AttributionFactorViewComponent,
        AttributionSettingsComponent,
        TimePeriodSettingsComponent,
        AdvancedAttributionSettingsComponent,
        AttributionSettingsModalDialogComponent
    ],
    exports: [
        AttributionSettingsComponent,
        TimePeriodSettingsComponent,
        AdvancedAttributionSettingsComponent
    ]
})
export class PerformanceModule {
}
