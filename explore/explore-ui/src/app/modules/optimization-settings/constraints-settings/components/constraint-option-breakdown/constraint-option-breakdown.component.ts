import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {Breakdown, BreakdownBuilderSettings, BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';
import {WidgetConfigFactory} from '../../../../../factories';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, takeUntil, withLatestFrom} from 'rxjs/operators';
import {CommonConstants} from '@constants/common.constants';
import {CoreFavoriteConstants, SubscribableComponent, WidgetConfigInput, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';

@Component({
    selector: 'app-constraint-option-breakdown',
    templateUrl: './constraint-option-breakdown.component.html',
    styleUrls: ['./constraint-option-breakdown.component.scss']
})
export class ConstraintOptionBreakdownComponent extends SubscribableComponent implements OptionValueComponent<Breakdown, OptimizationSettings>, OnInit {
    @Input() options: Array<ConstraintOption<Breakdown>>;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<Breakdown>> = new EventEmitter();

    key: string;
    breakdown$: Observable<Breakdown>;
    breakdownBuilderSettings: BreakdownBuilderSettings;
    breakdownUpdated$: Subject<void> = new Subject();

    ngOnInit(): void {
        const option: ConstraintOption<Breakdown> = this.options[0];
        this.key = option.optionAttribute.key;
        this.breakdown$ = option.value$.pipe(
            map((value: Breakdown) => this.getBreakdown(value)),
            distinctUntilChanged(),
            shareReplay(1));
        this.breakdownBuilderSettings = this.createBreakdownBuilderSettings();
        this.breakdownUpdated$.pipe(
            withLatestFrom(this.breakdown$),
            takeUntil(this.ngUnsubscribe)
        ).subscribe(([_updated, breakdown]: [void, Breakdown]) => {
            this.updated.emit({
                key: this.key,
                value: breakdown
            });
        });
    }

    onBreakdownChanged(): void {
        this.breakdownUpdated$.next();
    }

    private getBreakdown(value: Breakdown): Breakdown {
        if (value) {
            return value;
        } else {
            const breakdown: Breakdown = new Breakdown();
            this.updated.emit({
                key: this.key,
                value: breakdown
            });
            return breakdown;
        }
    }

    private createBreakdownBuilderSettings(): BreakdownBuilderSettings {
        const breakdownBuilderSettings: BreakdownBuilderSettings = new BreakdownBuilderSettings();
        const breakdownInput: WidgetConfigInput = this.getInputsForWidgetConfigByName(WidgetConfigType.RISK_EXPOSURE, WidgetInputType.BREAKDOWN_TREE);
        if (breakdownInput) {
            breakdownBuilderSettings.columnFilter = breakdownInput.groupByColumnFilters;
            breakdownBuilderSettings.customSectorColumnFilter = breakdownInput.customColumnFilters;
        }
        breakdownBuilderSettings.fieldToUse = CommonConstants.COLUMN_TAG;
        breakdownBuilderSettings.favoriteType = BreakdownFavoriteConstants.BREAKDOWN;
        breakdownBuilderSettings.favoriteFolderType = breakdownBuilderSettings.favoriteType + CoreFavoriteConstants._FOLDER;
        breakdownBuilderSettings.includeNoBreakdownOption = false;
        return breakdownBuilderSettings;
    }

    private getInputsForWidgetConfigByName(configType: string, propertyName: string): WidgetConfigInput {
        return WidgetConfigFactory.getInputsForWidgetConfigByName(configType, propertyName);
    }
}
