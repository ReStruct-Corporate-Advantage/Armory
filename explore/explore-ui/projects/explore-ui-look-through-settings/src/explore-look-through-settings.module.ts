import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
    LookThroughSettingsComponent
} from './components/explore-look-through-settings.component';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';

@NgModule({
  declarations: [
      LookThroughSettingsComponent
  ],
    imports: [
        ExploreUiCoreModule
    ],
  exports: [
      LookThroughSettingsComponent
  ],
  schemas: [
        CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class ExploreLookThroughSettingsModule { }
