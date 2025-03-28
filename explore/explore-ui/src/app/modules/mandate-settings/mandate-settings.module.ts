import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {MandateSettingsModalComponent} from './mandate-settings-modal.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    declarations: [MandateSettingsModalComponent],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        SharedModule
    ],
    exports: [MandateSettingsModalComponent]
})
export class MandateSettingsModule {
}
