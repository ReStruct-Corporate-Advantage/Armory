import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {PerformanceSettingsComponent} from './performance-settings.component';
import {AdditionalPerformanceSettingsComponent} from './additional-performance-settings/additional-performance-settings.component';
import {SharedModule} from '../../shared/shared.module';
import {ExpostModule} from '../expost/expost.module';

@NgModule({
    declarations: [PerformanceSettingsComponent, AdditionalPerformanceSettingsComponent],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExpostModule,
        SharedModule
    ],
    exports: [
        PerformanceSettingsComponent,
    ]
})
export class PerformanceSettingsModule {
}
