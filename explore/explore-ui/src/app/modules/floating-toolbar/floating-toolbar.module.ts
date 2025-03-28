import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {PortfolioFloatingToolbarComponent} from './portfolio-floating-toolbar/portfolio-floating-toolbar.component';
import {ReportsFloatingToolbarComponent} from './reports-floating-toolbar/reports-floating-toolbar.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    declarations: [PortfolioFloatingToolbarComponent, ReportsFloatingToolbarComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        SharedModule
    ],
    exports: [PortfolioFloatingToolbarComponent, ReportsFloatingToolbarComponent]
})
export class FloatingToolbarModule {
}
