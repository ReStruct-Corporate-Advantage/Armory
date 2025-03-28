import {NgModule} from '@angular/core';
import {DateModule} from './date/date.module';
import {ExpostModule} from './expost/expost.module';
import {FavoriteModule} from './favorite/favorite.module';
import {PerformanceModule} from './performance/performance.module';
import {ScenarioModule} from './scenario/scenario.module';
import {UiModule} from './ui/ui.module';
import {TelemetryModule} from './telemetry/telemetry.module';
import {DialogModule} from './dialogs/dialog.module';
@NgModule({
    imports: [
        FavoriteModule,
        DateModule,
        ExpostModule,
        UiModule,
        ScenarioModule,
        TelemetryModule,
        PerformanceModule,
        DialogModule
    ],
    exports: [
        FavoriteModule,
        DateModule,
        ExpostModule,
        UiModule,
        ScenarioModule,
        TelemetryModule,
        PerformanceModule,
        DialogModule
    ]
})
export class ExploreUiCoreModule {
}
