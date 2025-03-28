import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExpostSettingsComponent} from './components/expost-settings/expost-settings.component';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
    ],
    declarations: [
        ExpostSettingsComponent
    ],
    exports: [
        ExpostSettingsComponent
    ]
})
export class ExpostModule {
}
