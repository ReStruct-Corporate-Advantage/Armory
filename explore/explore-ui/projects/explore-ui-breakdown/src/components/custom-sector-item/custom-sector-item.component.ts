import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Optional,
    Output,
    SimpleChange,
    ViewChild,
} from '@angular/core';
import {SectorRuleUtils} from '../../utils/sector-rule.utils';
import {isEqual, isUndefined} from 'lodash';
import {CustomSectorEventsService} from '../../services/custom-sector-events/custom-sector-events.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {CustomSectorColumnRuleComponent} from './custom-sector-column-rule/custom-sector-column-rule.component';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {takeUntil} from 'rxjs/operators';
import {SectorRuleBuilderModalResolver} from './sector-rule-builder-modal-resolver';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {BreakdownTreeNode} from '../../models/breakdown/breakdown-tree-node.model';
import {CustomSector} from '../../models/sector/custom-sector/custom-sector.model';
import {CustomSectorRule} from '../../models/sector/custom-sector/custom-sector-rule.model';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {GroupRule} from '../../models/sector/group-rule.model';
import {Rule} from '../../interfaces/rule.interface';
import {LinkedFavoriteSector} from '../../models/sector/linked-favorite-sector.model';
import {SECTOR_RULE_BUILDER_DIALOG_TOKEN, SectorRuleBuilderDialogProvider} from '../../token';
import {CustomSectorType} from '../../enums/custom-sector-type.enum';
import {SectorConstants} from '../../constants/sector.constants';
import {ColumnDefinition, FAVORITE_SERVICE_TOKEN, FavoriteServiceInterface} from '@blk/explore-ui-core';
import {EditableCustomSectorColumnRuleComponent} from './editable-custom-sector-column-rule/editable-custom-sector-column-rule.component';

@Component({
    selector: 'explore-custom-sector-item',
    templateUrl: './custom-sector-item.component.html',
    styleUrls: ['./custom-sector-item.component.scss']
})
export class CustomSectorItemComponent extends SectorRuleBuilderModalResolver implements OnChanges, OnInit {

    @Input()
    rule: ColumnSectorRule | GroupRule | CustomSectorRule;

    @Input()
    parent: CustomSector | Rule;

    @Input()
    groupIndex: number;

    @Input()
    ruleCaption: string;

    @Input()
    sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    @Input()
    editableRuleConfig: ColumnDefinition[];

    @Input()
    draggedSector$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @Output()
    removeRule = new EventEmitter();

    @Output()
    addRuleToParent = new EventEmitter<Rule>();

    @ViewChild(CustomSectorColumnRuleComponent, {static: false})
    customSectorColumnRuleComponent: CustomSectorColumnRuleComponent;

    @ViewChild('editableCustomSectorColumnRule', {static: false})
    editableCustomSectorColumnRule: EditableCustomSectorColumnRuleComponent;

    customSectorEventsServiceSubscribe: Subscription;

    isActiveRule: boolean;

    isGroupRule: boolean;

    isColumnRule: boolean;

    isFundSectorRule: boolean;

    isCustomSectorRule: boolean;

    isEditingRule = false;

    constructor(@Inject(SECTOR_RULE_BUILDER_DIALOG_TOKEN) sectorRuleBuilderDialogProvider: SectorRuleBuilderDialogProvider,
                @Optional() @Inject(FAVORITE_SERVICE_TOKEN) private favoriteService: FavoriteServiceInterface,
                componentFactoryResolver: ComponentFactoryResolver,
                public customSectorEventsService: CustomSectorEventsService) {
        super(sectorRuleBuilderDialogProvider, componentFactoryResolver);
    }

    ngOnInit(): void {
        this.loadComponent();
        this.customSectorEventsServiceSubscribe = this.customSectorEventsService.getActiveCustomSectorItem$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (customSectorItemComponent: CustomSectorItemComponent) => {
                    this.isActiveRule = customSectorItemComponent === this;
                }
            );
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        if (changes['rule'] && changes['rule'].currentValue !== changes['rule'].previousValue && !isUndefined(changes['rule'].currentValue)) {
            this.onRuleChange();
        }
        if (changes['groupIndex'] && changes['groupIndex'].currentValue !== changes['groupIndex'].previousValue) {
            this.onGroupIndexChange();
        }
        if (changes.sectorRuleBuilderConfig && this.sectorRuleBuilderConfig) {
            this.sectorRuleBuilderConfig.addRule = this.addRule;
        }
    }

    onRuleChange(): void {
        this.isGroupRule = this.rule instanceof GroupRule && !SectorRuleUtils.isNestedFundSectorRule(this.rule);
        this.isFundSectorRule = SectorRuleUtils.isNestedFundSectorRule(this.rule);
        this.isCustomSectorRule = this.rule instanceof CustomSectorRule;
        this.isColumnRule = this.rule instanceof ColumnSectorRule;
    }

    onGroupIndexChange(): void {
        // Make sure the index of the group is initialised.
        this.groupIndex = this.groupIndex ? this.groupIndex : 0;
        // If this is the first group, set it as the active item by default
        if (this.groupIndex === 0) {
            this.customSectorEventsService.setActiveCustomSector(this);
        }
    }

    /**
     * Event that is fired when the area is clicked in.
     */
    public onSectorSelection(event: Event): void {
        // Cancel the event so the parent divs don't also mark as active.
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
        this.customSectorEventsService.setActiveCustomSector(this);
    }

    /**
     * Will be called when custom sector node is dropped
     */
    onDrop(event: DragEvent): void {
        // This is done to stop drop event on parent custom sector rules
        event.preventDefault();
        event.stopPropagation();
        event.cancelBubble = true;
        const sectorNode = this.draggedSector$.getValue();
        const customSectorRule: CustomSectorRule = new CustomSectorRule();
        customSectorRule.customSector = new CustomSector();
        customSectorRule.customSector.id = Number(sectorNode.eventData.favoriteId);
        customSectorRule.customSector.title = sectorNode.label;
        // Details of custom sector will populate at background.
        this.favoriteService.getFavorite$(customSectorRule.customSector.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((customSector: CustomSector) => {
                    customSectorRule.customSector.copyFrom(customSector);
                }
            );
        // This is done when there is empty column rule in custom sector, so rather than adding new rule, we replace this existing rule
        if (this.isColumnRule && (this.rule as ColumnSectorRule).columnName === undefined && this.parent instanceof CustomSector) {
            this.parent.rule = customSectorRule;
        } else {
            this.addRule(customSectorRule);
        }
    }

    /**
     * Method called when draggable html element is dragged over custom sector item. This will be called when sector node is dragged over it.
     * We will only accept favorite custom sector node drop as we will create nested custom sector.
     */
    onDragOver(event: DragEvent): void {
        // check if dragged sector is favorite custom sector, otherwise ignore the event
        if (this.draggedSector$
            && this.draggedSector$.getValue()
            && this.draggedSector$.getValue().eventData
            && this.draggedSector$.getValue().eventData.favoriteId) {
            event.preventDefault();
            event.stopPropagation();
            event.cancelBubble = true;
        }
    }


    /**
     * Adds a rule under this item.
     */
    onAddRule(): void {
        // If it is lookthrough rule then we want to add an editable rule
        if (this.sectorRuleBuilderConfig.islookThroughRule) {
            if (this.editableCustomSectorColumnRule) {
                this.editableCustomSectorColumnRule.closeEditing();
            }
            this.addRule(new ColumnSectorRule());
            return;
        }
        // Following if clause is called when no rule has been defined and '+' icon is clicked && in case of an existingRule is a groupRule, a new rule is added to the existing rule
        if (this.isColumnRule && (this.rule as ColumnSectorRule).columnName === undefined) {
            this.customSectorColumnRuleComponent.editRule();
        } else {
            // New rules are added to existing rule
            const rule = new ColumnSectorRule();
            this.sectorRuleBuilderModalDialogComponent.openDialog(this.sectorRuleBuilderConfig, rule).subscribe(
                (newRule: Rule) => {
                    if (!isUndefined(newRule)) {
                        this.addRule(newRule);
                        if (this.sectorRuleBuilderConfig.islookThroughRule) {
                            this.sectorRuleBuilderConfig.updateLookThroughView();
                        }
                    }
                }
            );
        }
    }

    addRule = (rule: Rule, sector?: BreakdownTreeNode, condition?: string): void => {
        // There are 2 ways in which a rule can be added.
        // 1.  The current rule is a group in which case we want to add a column rule into it.
        // 2.  If the current rule is a column rule then we want to wrap it in a group and add a new column rule.
        let groupRule: GroupRule;
        let currentRule;  // Will have the current rule which is being modified

        if (sector) {
            currentRule = ((sector.sectorModel as LinkedFavoriteSector).sector as CustomSector).rule;
        } else {
            // In case of rule with customSectorType equals Portfolio or index, the rule is already nested therefore we handle it differently.
            if (!this.isPortfolioOrIndexNestedRule()) {
                currentRule = this.rule;
            }
        }

        // In case of a rule(nestedFundSectorRule) with customSectorType equals Portfolio or index, the rule is already a groupRule and we want to we handle it differently i.e like a columnSectorRule
        if (currentRule instanceof GroupRule && !SectorRuleUtils.isNestedFundSectorRule(currentRule)) {
            groupRule = currentRule;
        } else {
            // Create a new group and put the original item in it.
            if (currentRule) {
                groupRule = new GroupRule();
                groupRule.groupType = condition ? condition : SectorConstants.GROUP_RULE_CONDITION.AND;
                groupRule.addSubRule(currentRule);
            }

            // We need to handle the different situations of the parent objects.
            // It can be either a CustomSector object or a GroupRule.
            const parentSector = sector ? (sector.sectorModel as LinkedFavoriteSector).sector : this.parent;
            if (parentSector instanceof GroupRule) {
                const parentRule: GroupRule = parentSector;

                // In case, the selected rule is a nestedFundSectorRule, handle it differently
                if (SectorRuleUtils.isSectoringForPortfolioOrIndex(this.rule)) {
                    if (isEqual(parentRule.subRules[0], this.rule)) {
                        parentRule.subRules = (rule as GroupRule).subRules;
                    }
                } else {
                    // Find the index of the current sector in the parent.
                    const index: number = parentRule.subRules.indexOf(currentRule);
                    // New replace the original index with the new group.
                    parentRule.subRules[index] = groupRule;
                }

            } else if (parentSector instanceof CustomSector) {
                parentSector.rule = groupRule ? groupRule : rule;
            }
        }
        if (currentRule) {
            if (this.sectorRuleBuilderConfig.islookThroughRule && rule instanceof GroupRule) {
                rule.subRules?.forEach(r => groupRule.addSubRule(r));
            } else {
                groupRule.addSubRule(rule);
            }
        }
    };

    /**
     * When rule is added and no previous ones exist
     */
    addFirstRuleFromLT(rule: ColumnSectorRule | GroupRule): void {
        this.rule = rule;
        if (this.parent instanceof CustomSector) {
            this.parent.rule = rule;
        }
        this.sectorRuleBuilderConfig.updateLookThroughView();
    }

    /**
     * Checks whether the rule is of Portfolio or Index customSectorType
     */
    isPortfolioOrIndexNestedRule(): boolean {
        if (this.rule instanceof ColumnSectorRule) {
            return (this.rule.customSectorType === CustomSectorType.PORTFOLIO || this.rule.customSectorType === CustomSectorType.INDEX);
        } else {
            return false;
        }
    }

    /**
     * Called to replace this rule with new rule in parent.
     * This is when we change custom sector type of Attribute and Fund to Nested Custom Sector type and vice-versa
     */
    replaceRule(newRule: ColumnSectorRule | GroupRule) {
        if (this.parent instanceof CustomSector) {
            this.parent.rule = newRule;
        } else if (this.parent instanceof GroupRule) {
            const parentRule: GroupRule = this.parent;
            // Find the index of the current sector in the parent.
            const index: number = parentRule.subRules.indexOf(this.rule);
            // Remove this item from the parent.
            parentRule.subRules.splice(index, 1, newRule);
        }
    }

    /**
     * Adds a rule under this item.
     */
    onRemoveRule(): void {
        if (this.parent instanceof CustomSector) {
            // If we are removing the top level then we need to just set a new blank column rule into the custom sector.
            const customSector: CustomSector = this.parent;
            customSector.rule = new ColumnSectorRule();
        } else if (this.parent instanceof GroupRule) {
            const parentRule: GroupRule = this.parent;
            // Find the index of the current sector in the parent.
            const index: number = parentRule.subRules.indexOf(this.rule);
            // Remove this item from the parent.
            parentRule.subRules.splice(index, 1);
        }
        this.removeRule.emit();
    }

    /**
     *  Method called when sub-rule is removed in group rule
     */
    onSubRuleRemove(rule: Rule) {
        if (this.rule instanceof GroupRule) {
            const ruleIndex: number = this.rule.subRules.indexOf(rule);
            if (ruleIndex >= 0) {
                this.rule.subRules.splice(ruleIndex, 1);
            }
            if (this.rule.subRules.length === 0) {
                this.onRemoveRule();
            }
            if (this.rule.subRules.length === 1) {
                if (this.parent instanceof CustomSector) {
                    // set the subRule as topmost rule
                    this.parent.rule = this.rule.subRules[0];
                } else {
                    this.addRuleToParent.emit(this.rule.subRules[0]);
                    this.onRemoveRule();
                }
            }
        }
    }

    changeIsEditingRule(state: boolean): void {
        this.isEditingRule = state;
    }
}
