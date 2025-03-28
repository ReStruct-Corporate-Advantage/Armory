import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { CommonModule } from '@angular/common';
import { AladdinAngularComponentsModule } from '@blk/aladdin-angular-components';
import { TextInputComponent } from './components/text-input/text-input.component';
import { SelectComponent } from './components/select/select.component';

@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
    ],
    declarations: [
        ButtonComponent,
        CheckboxComponent,
        TextInputComponent,
        SelectComponent
    ],
    exports: [
        ButtonComponent,
        CheckboxComponent,
        TextInputComponent,
        SelectComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class ExploreADSWrapperModule { }
