import {ComponentFactoryResolver, Directive, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {isUndefined} from 'lodash';
import {SectorRuleBuilderModalResolver} from './sector-rule-builder-modal-resolver';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {GroupRule} from '../../models/sector/group-rule.model';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {SECTOR_RULE_BUILDER_DIALOG_TOKEN, SectorRuleBuilderDialogProvider} from '../../token';
import {Rule} from '../../interfaces/rule.interface';

/**
 * Base class for Column Sector Rule and Nested Fund sector rule
 */
@Directive()
export abstract class BaseCustomSectorRuleComponent<T extends ColumnSectorRule | GroupRule> extends SectorRuleBuilderModalResolver implements OnChanges, OnInit {

    @Input()
    rule: T;

    @Input()
    sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    @Output()
    replaceRule = new EventEmitter<ColumnSectorRule | GroupRule>();

    @Output()
    changeIsEditingRule = new EventEmitter();

    ruleText: string;

    constructor(@Inject(SECTOR_RULE_BUILDER_DIALOG_TOKEN) sectorRuleBuilderDialogProvider: SectorRuleBuilderDialogProvider, componentFactoryResolver: ComponentFactoryResolver) {
        super(sectorRuleBuilderDialogProvider, componentFactoryResolver);
    }

    ngOnInit(): void {
        this.loadComponent();
        this.updateRuleText();
    }

    /**
     * When the bindings change we need to re-init the control.
     */
    ngOnChanges(changes: SimpleChanges): void {
        this.onChanges(changes);
        if (changes.rule) {
            this.updateRuleText();
        }
    }

    checkOverflow (element) {
        return element.offsetHeight < element.scrollHeight ||
            element.offsetWidth < element.scrollWidth;
    }

    /**
     * Function that is fired when the rule is double-clicked on.
     */
    public editRule(): void {
        if (this.sectorRuleBuilderConfig.islookThroughRule){
            this.changeIsEditingRule.emit(true);
        }
        this.sectorRuleBuilderModalDialogComponent.openDialog(this.sectorRuleBuilderConfig, this.rule).subscribe(
            (newRule: ColumnSectorRule | GroupRule) => {
                if (!isUndefined(newRule)) {
                    // Check if column sector rule was converted to Nested Fund sector rule and vice-versa
                    if (newRule.ruleType === this.rule.ruleType) {
                        this.updateRule(newRule);
                        this.updateRuleText();
                        if (this.sectorRuleBuilderConfig.islookThroughRule) {
                            this.sectorRuleBuilderConfig.updateLookThroughView();
                        }
                    } else {
                        // replace the column sector with Nested fund sector group rule or vice-versa
                        this.replaceRule.emit(newRule);
                    }
                }
            }
        );
    }

    /**
     * Method to update rule
     */
    abstract updateRule(rule: Rule);

    /**
     * Method to update rule text shown on UI
     */
    abstract updateRuleText();

    /**
     * Called when any input bindings are changed
     */
    abstract onChanges(changes: SimpleChanges);

}
