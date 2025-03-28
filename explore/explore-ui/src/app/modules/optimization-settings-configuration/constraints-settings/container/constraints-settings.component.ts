import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {OptimizationSummaryWithValues} from '../../models/optimization-summary-with-values';
import {AuxTabBarItemInterface} from '@blk/aladdin-angular-components';
import {isEmpty} from 'lodash';
import {RELAXATION_CONSTRAINTS_TITLE} from '@optimization-settings/constants/optimization-title.constants';

@Component({
    selector: 'app-constraints-settings',
    templateUrl: './constraints-settings.component.html',
    styleUrls: ['./constraints-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConstraintsSettingsComponent<C, P> implements OnInit {
    @Input() parentConfig: P;
    @Input() summariesWithValues: OptimizationSummaryWithValues<C>[];
    @Input() activeSubType: string;
    clearSelection: boolean;

    activeIndex: number;
    settingsTabData: AuxTabBarItemInterface[];
    constraintsData: any;

    ngOnInit(): void {
        const activeIndex: number = this.summariesWithValues.findIndex((summaryWithValue) => summaryWithValue.summary.subType === this.activeSubType);
        this.activeIndex = activeIndex === -1 ? 0 : activeIndex;
        this.constraintsData = this.getConstraintsData();
        this.settingsTabData = this.summariesWithValues.map((summaryWithValue, index) => {
            return {label: summaryWithValue.summary.title, uid: index.toString()};
        });
    }

    /**
     * Method invoked on tab switch
     */
    onTabSelected(event: CustomEvent): void {
        this.activeIndex = Number(event.detail.uid);
        this.clearSelection = true;
        this.constraintsData = this.getConstraintsData();
    }

    getConstraintsData() {
        const activeTabData: OptimizationSummaryWithValues<C> = this.summariesWithValues[this.activeIndex];
        if (activeTabData?.summary?.title === RELAXATION_CONSTRAINTS_TITLE) {
            return this.summariesWithValues
                .filter(summaryWithValues => !isEmpty(summaryWithValues.values) && summaryWithValues.summary.title !== RELAXATION_CONSTRAINTS_TITLE)
                .map(summaryWithValues => summaryWithValues.values)
                .reduce((accumulator, value) => accumulator.concat(value), [])
                .filter(constraint => constraint.isRelaxable);
        }
        return activeTabData?.values;
    }
}
