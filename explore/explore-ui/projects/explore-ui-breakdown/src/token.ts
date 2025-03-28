import { Type, InjectionToken } from '@angular/core';

export const SECTOR_RULE_BUILDER_DIALOG_TOKEN = new InjectionToken<SectorRuleBuilderDialogProvider>('SECTOR_RULE_BUILDER_DIALOG_TOKEN');

export interface SectorRuleBuilderDialogProvider {
    component: Type<any>;
}
