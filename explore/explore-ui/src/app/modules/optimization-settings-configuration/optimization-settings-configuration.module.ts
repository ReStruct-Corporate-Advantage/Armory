import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OptimizationSettingsModalComponent} from './optimization-settings-modal.component';
import {FormsModule} from '@angular/forms';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {HorizontalDisplayFormComponent} from './horizontal-display-form/components/horizontal-display-form/horizontal-display-form.component';
import {HorizontalDisplayFormRowComponent} from './horizontal-display-form/components/horizontal-display-form-row/horizontal-display-form-row.component';
import {ConstraintOptionNumberComponent} from './constraints-settings/components/constraint-option-number/constraint-option-number.component';
import {ConstraintOptionWrapperComponent} from './constraints-settings/components/constraint-option-wrapper/constraint-option-wrapper.component';
import {ConstraintOptionSelectComponent} from './constraints-settings/components/constraint-option-select/constraint-option-select.component';
import {ConstraintOptionBoundsComponent} from './constraints-settings/components/constraint-option-bounds/constraint-option-bounds.component';
import {ConstraintOptionRadioComponent} from './constraints-settings/components/constraint-option-radio/constraint-option-radio.component';
import {ConstraintsSettingsComponent} from './constraints-settings/container/constraints-settings.component';
import {ConstraintSettingsComponent} from './constraints-settings/components/constraint-settings/constraint-settings.component';
import {ConstraintOptionsComponent} from './constraints-settings/components/constraint-options/constraint-options.component';
import {ConstraintOptionBoundsLongShortComponent} from './constraints-settings/components/constraint-option-bounds-long-short/constraint-option-bounds-long-short.component';
import {ConstraintOptionTextComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-text/constraint-option-text.component';
import {SharedModule} from '../../shared/shared.module';
import {ConstraintOptionEfficientFrontierNumberComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-efficient-frontier-number/constraint-option-efficient-frontier-number.component';
import {ConstraintOptionEfficientEnabledBoundsComponent} from './constraints-settings/components/constraint-option-efficient-enabled-bounds/constraint-option-efficient-enabled-bounds.component';
import {ConstraintOptionMinTradeSizeComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-min-trade-size/constraint-option-min-trade-size.component';
import {LoadingModule} from '../loading/loading.module';
import {ConstraintOptionMissingDataComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-missing-data/constraint-option-missing-data.component';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
        OptimizationSettingsModalComponent,
        HorizontalDisplayFormComponent,
        HorizontalDisplayFormRowComponent,
        ConstraintsSettingsComponent,
        ConstraintSettingsComponent,
        ConstraintOptionsComponent,
        ConstraintOptionTextComponent,
        ConstraintOptionNumberComponent,
        ConstraintOptionWrapperComponent,
        ConstraintOptionSelectComponent,
        ConstraintOptionBoundsComponent,
        ConstraintOptionRadioComponent,
        ConstraintOptionBoundsLongShortComponent,
        ConstraintOptionEfficientFrontierNumberComponent,
        ConstraintOptionEfficientEnabledBoundsComponent,
        ConstraintOptionMinTradeSizeComponent,
        ConstraintOptionMissingDataComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AladdinAngularComponentsModule,
        SharedModule,
        LoadingModule
    ],
              exports: [
                  OptimizationSettingsModalComponent,
                  HorizontalDisplayFormComponent,
                  ConstraintsSettingsComponent,
                  ConstraintOptionTextComponent,
                  ConstraintOptionNumberComponent,
                  ConstraintOptionWrapperComponent,
                  ConstraintOptionSelectComponent,
                  ConstraintOptionBoundsComponent,
                  ConstraintOptionRadioComponent,
                  ConstraintOptionBoundsLongShortComponent,
                  ConstraintOptionNumberComponent,
                  ConstraintOptionEfficientFrontierNumberComponent,
                  ConstraintOptionMinTradeSizeComponent
              ]
          })
export class OptimizationSettingsConfigurationModule {}
