import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {ExploreUiRiskModule} from '@blk/explore-ui-risk';
import {SectorAttributeRuleBuilderComponent} from './components/sector-attribute-rule-builder/sector-attribute-rule-builder.component';
import {SectorAttributeRuleDateFieldComponent} from './components/sector-attribute-rule-builder/sector-attribute-rule-date-field/sector-attribute-rule-date-field.component';
import {SectorAttributeRuleNumericFieldComponent} from './components/sector-attribute-rule-builder/sector-attribute-rule-numeric-field/sector-attribute-rule-numeric-field.component';
import {SectorAttributeRuleOperatorComponent} from './components/sector-attribute-rule-builder/sector-attribute-rule-operator/sector-attribute-rule-operator.component';
import {SectorAttributeRuleStaticColumnFieldComponent} from './components/sector-attribute-rule-builder/sector-attribute-rule-static-column-field/sector-attribute-rule-static-column-field.component';
import {SectorAttributeRuleTextFieldComponent} from './components/sector-attribute-rule-builder/sector-attribute-rule-text-field/sector-attribute-rule-text-field.component';
import {SectorAttributeRuleTimeSpanFieldComponent} from './components/sector-attribute-rule-builder/sector-attribute-rule-time-span-field/sector-attribute-rule-time-span-field.component';
import {SectorRuleBuilderModalDirective} from './components/sector-rule-builder-modal/sector-rule-builder-modal.directive';
import {BaseSectorRuleBuilderModalComponent} from './components/sector-rule-builder-modal/base-sector-rule-builder-modal.component';
import {SECTOR_RULE_BUILDER_DIALOG_TOKEN} from './token';
import {NestedCustomSectorRuleComponent} from './components/custom-sector-item/nested-custom-sector-rule/nested-custom-sector-rule.component';
import {NestedFundSectorRuleComponent} from './components/custom-sector-item/nested-fund-sector-rule/nested-fund-sector-rule.component';
import {CustomSectorItemComponent} from './components/custom-sector-item/custom-sector-item.component';
import {CustomSectorColumnRuleComponent} from './components/custom-sector-item/custom-sector-column-rule/custom-sector-column-rule.component';
import {CustomSectorEventsService} from './services/custom-sector-events/custom-sector-events.service';
import {ExploreCustomFilterComponent} from './components/explore-custom-filter/explore-custom-filter.component';
import {EditableCustomSectorColumnRuleComponent} from './components/custom-sector-item/editable-custom-sector-column-rule/editable-custom-sector-column-rule.component';

@NgModule({
    imports: [
        CommonModule,
        ExploreUiCoreModule,
        ExploreUiColumnOptionModule,
        ExploreUiRiskModule
    ],
    declarations: [
        SectorAttributeRuleBuilderComponent,
        SectorAttributeRuleDateFieldComponent,
        SectorAttributeRuleNumericFieldComponent,
        SectorAttributeRuleOperatorComponent,
        SectorAttributeRuleStaticColumnFieldComponent,
        SectorAttributeRuleTextFieldComponent,
        SectorAttributeRuleTimeSpanFieldComponent,
        SectorRuleBuilderModalDirective,
        BaseSectorRuleBuilderModalComponent,
        NestedCustomSectorRuleComponent,
        NestedFundSectorRuleComponent,
        CustomSectorItemComponent,
        CustomSectorColumnRuleComponent,
        ExploreCustomFilterComponent,
        EditableCustomSectorColumnRuleComponent
    ],
    exports: [
        SectorAttributeRuleBuilderComponent,
        SectorAttributeRuleStaticColumnFieldComponent,
        SectorRuleBuilderModalDirective,
        CustomSectorItemComponent,
        ExploreCustomFilterComponent
    ],
    providers: [
        {provide: SECTOR_RULE_BUILDER_DIALOG_TOKEN, useValue: {component: BaseSectorRuleBuilderModalComponent}},
        CustomSectorEventsService
    ]
})
export class ExploreUiBreakdownModule {
}
