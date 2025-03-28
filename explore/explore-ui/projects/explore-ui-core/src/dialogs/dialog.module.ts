import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreDialogComponent} from './explore-dialog.component';

@NgModule({
    declarations: [ExploreDialogComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, AladdinAngularComponentsModule],
    exports: [ExploreDialogComponent],
    providers: []
})
export class DialogModule {
}
