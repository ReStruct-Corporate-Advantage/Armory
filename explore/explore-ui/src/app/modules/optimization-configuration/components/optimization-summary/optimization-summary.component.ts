import {ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {OptimizationSummary} from '@optimization-settings-configuration/models/optimization-summary.model';
import {OptimizationSummaryData} from '@optimization-settings-configuration/models/optimization-summary-data.model';
import {OPTIMIZATION_SERVICE} from '../../tokens/optimization-service.token';
import {OptimizationService} from '../../services/optimization-service.interface';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

@Component({
    selector: 'app-optimization-summary',
    templateUrl: './optimization-summary.component.html',
    styleUrls: ['./optimization-summary.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizationSummaryComponent implements OnInit {
    @Input() optimizationSummary: OptimizationSummary;
    @Input() optimizationId: string;
    @Input() isRiskParitySettings: boolean;
    @Output() edit: EventEmitter<void> = new EventEmitter();

    optimizationSummaryData$: Observable<OptimizationSummaryData>;
    showOptionsLabel$: Observable<boolean>;
    showData$: Observable<boolean>;

    constructor(@Inject(OPTIMIZATION_SERVICE) private optimizationService: OptimizationService) {}

    ngOnInit() {
        this.optimizationSummaryData$ = this.optimizationService
            .getOptimizationSummaryData$(this.optimizationId, this.optimizationSummary.type, this.optimizationSummary.subType, this.isRiskParitySettings)
            .pipe(shareReplay(1));
        this.showOptionsLabel$ = this.optimizationSummaryData$.pipe(
            map((optimizationSummaryData: OptimizationSummaryData) => !!optimizationSummaryData.additionalData && !!optimizationSummaryData.additionalData.optionsValue)
        );
        this.showData$ = this.optimizationSummaryData$.pipe(
            map((optimizationSummaryData: OptimizationSummaryData) => !!optimizationSummaryData.data)
        );
    }

    onEdit(): void {
        this.edit.emit();
    }
}
