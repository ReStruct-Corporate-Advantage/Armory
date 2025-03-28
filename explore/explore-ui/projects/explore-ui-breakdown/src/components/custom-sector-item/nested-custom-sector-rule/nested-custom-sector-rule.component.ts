import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CustomSectorRule} from '../../../models/sector/custom-sector/custom-sector-rule.model';

/**
 * This is the control for a nested custom sector.  In the builder the user has the ability to drag in a custom sector an that
 * will be represented by this control.
 * The only thing a user can do with this is toggle that it equals or is not equal to the custom sector.
 */
@Component({
    selector: 'explore-nested-custom-sector-rule',
    templateUrl: './nested-custom-sector-rule.component.html',
    styleUrls: ['./nested-custom-sector-rule.component.scss']
})
export class NestedCustomSectorRuleComponent implements OnChanges, OnInit {

    @Input()
    rule: CustomSectorRule;

    ruleText: string;

    constructor() {
    }

    ngOnInit(): void {
        this.updateRuleText();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['rule'] && changes['rule'].currentValue !== changes['rule'].previousValue) {
            this.updateRuleText();
        }
    }

    /**
     * Function that is fired when the rule is double clicked on.
     */
    public editRule(): void {
        this.rule.toggleEquals();
        this.updateRuleText();
    }

    /**
     * Updates the display text for this rule.
     */
    private updateRuleText(): void {
        this.ruleText = (this.rule && this.rule.customSector) ? this.rule.getDisplayText() : 'Custom sector not defined';
    }
}
