import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {AdvancedTreeListComponent} from './components/advanced-tree-list/advanced-tree-list.component';
import {ColorPickerComponent} from './components/color-picker/color-picker.component';
import {SentenceCasePipe} from './pipes/sentence-case.pipe';
import {UndoButtonComponent} from './components/undo/undo-button.component';

@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule
    ],
    declarations: [
        ColorPickerComponent,
        AdvancedTreeListComponent,
        SentenceCasePipe,
        UndoButtonComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        AladdinAngularComponentsModule,
        ColorPickerComponent,
        AdvancedTreeListComponent,
        SentenceCasePipe,
        UndoButtonComponent
    ]
})
export class UiModule {
}
