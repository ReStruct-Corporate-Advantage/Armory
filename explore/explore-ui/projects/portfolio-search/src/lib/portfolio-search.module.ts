import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {PortfolioSearchComponent} from './component/portfolio-search.component';
import {CommonModule} from '@angular/common';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';

@NgModule({
    declarations: [PortfolioSearchComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        FormsModule,
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule
    ],
    exports: [PortfolioSearchComponent]
})
export class PortfolioSearchModule {
}
