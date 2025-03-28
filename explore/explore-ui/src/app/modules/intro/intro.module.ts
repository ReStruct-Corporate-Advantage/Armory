import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {IntroComponent} from './intro.component';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {FavoriteModule} from '../favorite/favorite.module';
import {DialogModule} from '@blk/explore-ui-core';

/**
 * Module for all the meta data which includes user meta data, column definitions, mandate mapping
 */
@NgModule({
    declarations: [IntroComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, PortfolioSearchModule, AladdinAngularComponentsModule, FavoriteModule, DialogModule],
    exports: [IntroComponent],
    providers: []
})
export class IntroModule { }
