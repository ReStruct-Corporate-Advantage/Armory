import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Input, OnChanges,
    SimpleChanges, Output, EventEmitter
} from '@angular/core';
import {AuxAdvancedTreeListInterface, AuxAdvancedTreeListItemDoubleClickedDetailInterface} from '@blk/aladdin-angular-components';
import {HorizontalDisplayFormIndexEvent} from '../../../horizontal-display-form/models/horizontal-display-form-index-event.model';
import {HorizontalDisplayFormValueEvent} from '../../../horizontal-display-form/models/horizontal-display-form-value-event.model';
import {cloneDeep, Dictionary, isEmpty, isNumber} from 'lodash';
import {take} from 'rxjs/operators';
import {OptimizationSummary} from '../../../models/optimization-summary.model';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {ConstraintsSettingsService} from '../../interfaces/constraints-settings-service.interface';
import {CONSTRAINTS_SETTINGS_SERVICE} from '../../tokens/constraints-settings-service.token';
import {CONSTRAINT_TRANSFORMER_SERVICE} from '../../tokens/constraint-transformer-service.token';
import {ConstraintTransformerService} from '../../interfaces/constraint-transformer-service.interface';
import {
    SUB_TYPE_PORTFOLIO_CONSTRAINTS
} from '@optimization-settings/constants/optimization-types.constants';
import {ColumnUtils} from '@utils/column.utils';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {NotificationService} from '@services/notification';
import {ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {RELAXATION_COL_DEF} from '@optimization-settings/constraints-settings/constants/constraint-col-defs.constants';
import {CONSTRAINT_RELATIONS} from '@optimization-settings/constraints-settings/constants/constraint.constants';
import {
    ConstraintRelationsKey
} from '@optimization-settings/constraints-settings/models/constraint-relations-key.model';
import {DependentConstraintsMetaData} from '@optimization-settings/constraints-settings/models/dependent-constraints-meta-data.model';
import {CompositionUtils} from '@utils/composition.utils';

@Component({
    selector: 'app-constraint-settings',
    templateUrl: './constraint-settings.component.html',
    styleUrls: ['./constraint-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConstraintSettingsComponent<C, D, P> implements OnChanges {
    @Input() summary: OptimizationSummary;
    @Input() constraints: C[];
    @Input() parentConfig: P;
    @Input() isClearSelection: boolean;
    @Output() isClearSelectionChange = new EventEmitter<boolean>();

    constraintMeasures: AuxAdvancedTreeListInterface[];
    rows: Subject<Dictionary<any>>[] = [];
    selectedConstraintIndex: number;
    selectedConstraint: C;
    loadingConstraintOptions = false;

    constructor(
        @Inject(CONSTRAINTS_SETTINGS_SERVICE) private constraintsSettingsService: ConstraintsSettingsService<C, D>,
        @Inject(CONSTRAINT_TRANSFORMER_SERVICE) private constraintTransformerService: ConstraintTransformerService<C>,
        private notificationService: NotificationService,
        private cdRef: ChangeDetectorRef
    ) {}

    ngOnChanges(_changes: SimpleChanges) {
        this.constraintMeasures = ColumnUtils.createConstraintMeasures(this.summary.subType, null, true);
        this.createRows();
        if (this.isClearSelection) {
            this.clearSelection();
        }
    }

    onDoubleClicked(event: CustomEvent<AuxAdvancedTreeListItemDoubleClickedDetailInterface>): void {
        const indexOfConstraint = this.constraints.findIndex((constraint: any) => constraint.constraintTag === event.detail.value.eventData.columnTag);
        // If we already have a similar portfolio constraint present, do not duplicate it instead select the previous one.
        if (event.detail.value.eventData && event.detail.value.eventData.constraintType === SUB_TYPE_PORTFOLIO_CONSTRAINTS && indexOfConstraint !== -1) {
            this.onSelected(indexOfConstraint);
            return;
        }
        const constraintDefinition: D = event.detail.value.eventData;
        if (constraintDefinition) {
            this.addConstraint(constraintDefinition);
        }
    }

    onEnabled(event: HorizontalDisplayFormIndexEvent<boolean>): void {
        this.constraintsSettingsService.updateConstraintEnabled(this.constraints[event.index], event.value);
        this.updateRow(event.index);
    }

    onTableUpdated(event: HorizontalDisplayFormIndexEvent<HorizontalDisplayFormValueEvent>): void {
        const res: { relatedConstraints: C[]; message?: string, rowIndex?: number } | Error = this.getRelatedConstraintsToUpdate(this.constraints[event.index], event.index);
        const relatedConstraintsInfo:  { relatedConstraints: C[]; message?: string, rowIndex?: number } = res as  { relatedConstraints: C[]; message?: string, rowIndex?: number };
        if (!isEmpty(relatedConstraintsInfo.message)) {
            // show message
            this.notificationService.message(relatedConstraintsInfo.message, true);
        }
        // modified the related constraints
        relatedConstraintsInfo.relatedConstraints.forEach(constraint => this.constraintsSettingsService.updateConstraintField(constraint, event.value.name, event.value.value));
        if (isNumber(relatedConstraintsInfo?.rowIndex)) {
            this.updateRow(relatedConstraintsInfo.rowIndex);
        } else {
            // updated the rows as well based on the index of the constraint
            relatedConstraintsInfo.relatedConstraints.map(constraint => this.constraints.indexOf(constraint)).forEach(idx => this.updateRow(idx));
        }
    }

    onOptionsUpdated(): void {
        this.updateRow(this.selectedConstraintIndex);
        this.cdRef.detectChanges();
    }

    onDeleted(constraintIndex: number): void {
        const deletedConstraint = this.constraints.splice(constraintIndex, 1)[0];
        if (this.parentConfig instanceof OptimizationSettings && deletedConstraint instanceof Constraint) {
            this.parentConfig.efficientEnabledConstraints.delete(deletedConstraint);
        }
        this.deleteRow(constraintIndex);
        this.clearSelection();
    }

    onSelected(constraintIndex: number): void {
        const selectedConstraint = this.constraints[constraintIndex];
        if (this.constraintsSettingsService.requiresConstraintOptionsLoad(selectedConstraint)) {
            this.clearSelection();
            this.loadingConstraintOptions = true;
            this.constraintsSettingsService.loadConstraintOptions$(selectedConstraint)
                .pipe(take(1))
                .subscribe(() => {
                    this.setSelectedConstraint(constraintIndex, selectedConstraint);
                    this.loadingConstraintOptions = false;
                    this.cdRef.markForCheck();
                });
        } else {
            this.setSelectedConstraint(constraintIndex, selectedConstraint);
        }
    }

    onCloned(constraintIndex: number): void {
        if (CompositionUtils.checkIfConstraintInEfficientFormat(this.constraints[constraintIndex] as Constraint)) {
            this.notificationService.error('Can not clone Efficient Frontier enabled constraint', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_CLONED_ERROR);
            return;
        }

        this.addConstraint(null, this.constraints[constraintIndex]);
    }

    private setSelectedConstraint(constraintIndex: number, constraint: C): void {
        this.selectedConstraintIndex = constraintIndex;
        this.selectedConstraint = constraint;
    }

    private addConstraint(constraintDefinition: D, constraintSrc?: C): void {
        this.clearSelection();
        this.loadingConstraintOptions = true;
        const constraintObs = !constraintSrc
            ? this.constraintsSettingsService.createConstraint$(constraintDefinition)
            : of(cloneDeep(constraintSrc));
        constraintObs.pipe(take(1))
            .subscribe((constraint: C) => {
                this.updateConstraintValueOnAdd(constraint, this.constraints);
                const constraintsLength = this.constraints.push(constraint);
                this.selectedConstraintIndex = constraintsLength - 1;
                this.updateRow(this.selectedConstraintIndex);
                this.selectedConstraint = constraint;
                this.loadingConstraintOptions = false;
                this.cdRef.markForCheck();
            });
    }

    /**
     * update constraint field if the constraint type is one of the co-related constraints
     */
    private updateConstraintValueOnAdd(constraint: C, constraints: C[]): void | Error {
        if (!constraint) {
            throw new Error('Found no constraint to update field');
        }
        this.updateConstraints(constraint, constraints, 'constraintType');
        this.updateConstraints(constraint, constraints, 'constraintTag');
    }

    private updateConstraints(constraint: C, constraints: C[], fieldName: string) {
        const constraintTagRelaxationKey = ConstraintRelationsKey.createEasyObject(constraint[fieldName], RELAXATION_COL_DEF.field);
        if (CONSTRAINT_RELATIONS.has(constraintTagRelaxationKey) && constraint['isRelaxable']) {
            // get dependent constraints
            const dependentMetaData: DependentConstraintsMetaData = CONSTRAINT_RELATIONS.get(constraintTagRelaxationKey);
            let dependentConstraintsWithRelaxationEnabled: C[];
            if (fieldName === 'constraintType') {
                dependentConstraintsWithRelaxationEnabled = constraints?.filter(existingConstraint => existingConstraint[fieldName] === constraint[fieldName] && !!existingConstraint['relaxationValue']);
            } else if (fieldName === 'constraintTag') {
                dependentConstraintsWithRelaxationEnabled = constraints?.filter(existingConstraint => dependentMetaData['dependentConstraintTags'].includes(existingConstraint[fieldName]) && !!existingConstraint['relaxationValue']);
            }
            if (!isEmpty(dependentConstraintsWithRelaxationEnabled)) {
                this.constraintsSettingsService.updateConstraintField(constraint, 'relaxationValue', 1);
                if (!isEmpty(dependentMetaData['notification'])) {
                    // show message
                    this.notificationService.message(dependentMetaData['notification'], true);
                }
            }
        }
    }

    clearSelection(): void {
        this.selectedConstraintIndex = undefined;
        this.selectedConstraint = undefined;
        this.isClearSelectionChange.emit(false);
    }

    private createRows(): void {
        this.rows = this.constraints.map((constraint: C) => new BehaviorSubject(this.createRow(constraint)));
    }

    private updateRow(index: number): void {
        const row: Dictionary<any> = this.createRow(this.constraints[index]);
        const row$ = this.rows[index];
        if (!row$) {
            this.rows[index] = new BehaviorSubject(row);
        } else {
            row$.next(row);
        }
    }

    private deleteRow(index: number): void {
        this.rows.splice(index, 1);
    }

    private createRow(constraint: C): Dictionary<any> {
        return this.constraintTransformerService.transform(constraint, this.summary.subType);
    }

    /**
     * logic to get related constraint for the given input constraint
     */
    private getRelatedConstraintsToUpdate(constraint: C, rowIndex: number): { relatedConstraints: C[], message?: string, rowIndex?: number} | Error {
        if (!constraint) {
            throw new Error('Found no constraint to work on.');
        }
        let dependentConstraints: { relatedConstraints: C[], message?: string, rowIndex?: number} | Error = this.getDependentConstraints(constraint, 'constraintType');
        if (!isEmpty(dependentConstraints)) {
            return dependentConstraints;
        }
        dependentConstraints = this.getDependentConstraints(constraint, 'constraintTag');
        if (!isEmpty(dependentConstraints)) {
            return dependentConstraints;
        }

        return {relatedConstraints: [constraint], rowIndex};
    }

    private getDependentConstraints(constraint: C, fieldName: string): { relatedConstraints: C[], message?: string, rowIndex?: number} | Error {
        const constraintRelaxationKey = ConstraintRelationsKey.createEasyObject(constraint[fieldName], RELAXATION_COL_DEF.field);
        if (CONSTRAINT_RELATIONS.has(constraintRelaxationKey)) {
            // get dependent constraints
            const dependentMetaData: DependentConstraintsMetaData = CONSTRAINT_RELATIONS.get(constraintRelaxationKey);
            let dependentConstraints: C[];

            if (fieldName === 'constraintType') {
                dependentConstraints = this.constraints.filter(constraintAtIdx => constraintAtIdx['isRelaxable'] && constraintAtIdx[fieldName] === constraint[fieldName]);
            } else if (fieldName === 'constraintTag') {
                dependentConstraints = this.constraints.filter(constraintObj => dependentMetaData['dependentConstraintTags'].includes(constraintObj[fieldName]));
            }

            // add original constraints also to the dependent array
            dependentConstraints.push(constraint);
            return {
                relatedConstraints: dependentConstraints,
                message: dependentMetaData['notification']
            };
        }
    }
}
