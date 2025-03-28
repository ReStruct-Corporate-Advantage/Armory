import {Component, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {cloneDeep} from 'lodash';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {GroupRule} from '../../models/sector/group-rule.model';
import {Rule} from '../../interfaces/rule.interface';
import {SectorAttributeRuleBuilderComponent} from '../sector-attribute-rule-builder/sector-attribute-rule-builder.component';
import {CustomSectorType} from '../../enums/custom-sector-type.enum';
import {SectorRuleBuilderModalDynamicComponent} from './sector-rule-builder-modal-dynamic.component';

/**
 * Component used to create/update Column Sector Rule
 *
 * <explore-sector-rule-builder-modal></explore-sector-rule-builder-modalg>
 */
@Component({
    selector: 'explore-sector-rule-builder-modal',
    templateUrl: './base-sector-rule-builder-modal.component.html',
    styleUrls: ['./base-sector-rule-builder-modal.component.scss']
})
export class BaseSectorRuleBuilderModalComponent implements SectorRuleBuilderModalDynamicComponent {

    @ViewChild(SectorAttributeRuleBuilderComponent, {static: false})
    sectorAttributeRuleBuilderComponent: SectorAttributeRuleBuilderComponent;

    sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    rule: ColumnSectorRule | GroupRule;

    responseSubject: Subject<ColumnSectorRule | GroupRule>;

    isDialogOpen = false;

    activeTabIndex = 0;

    originalRule: ColumnSectorRule | GroupRule;

    ruleCustomSectorType: CustomSectorType;

    /**
     * Method to open dialog to edit/update Column Sector Rule
     */
    openDialog(sectorRuleBuilderConfig: SectorRuleBuilderConfig, rule: ColumnSectorRule | GroupRule): Observable<Rule> {
        this.sectorRuleBuilderConfig = sectorRuleBuilderConfig;
        this.originalRule = rule;
        this.rule = cloneDeep(this.originalRule);
        this.setRuleCustomSectorType();
        this.isDialogOpen = true;
        this.responseSubject = new Subject<ColumnSectorRule | GroupRule>();
        return this.responseSubject.asObservable();
    }

    protected setRuleCustomSectorType() {
        this.ruleCustomSectorType = CustomSectorType.ATTRIBUTES;
    }

    /**
     * Called when cancel button is clicked
     */
    onCancelClick() {
        this.closeDialog();
        this.responseSubject.next(undefined);
    }

    /**
     * Method to close dialog
     */
    closeDialog(): void {
        this.isDialogOpen = false;
        this.responseSubject.complete();
    }

    /**
     * Method is called on click of done button of dialog
     */
    onDone(): void {
        if (!this.sectorAttributeRuleBuilderComponent.validateRule()) {
            return;
        }
        // Pushes new rule if rule was updated otherwise push undefined
        this.responseSubject.next(this.sectorAttributeRuleBuilderComponent.updateRule() ? this.rule : undefined);
        this.closeDialog();
    }

}
