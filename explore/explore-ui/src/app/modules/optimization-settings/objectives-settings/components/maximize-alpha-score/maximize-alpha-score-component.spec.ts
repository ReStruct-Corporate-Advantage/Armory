import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaximizeAlphaScoreComponent} from '@optimization-settings/objectives-settings/components/maximize-alpha-score/maximize-alpha-score.component';
import {SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY} from '@optimization-settings/constants/optimization-summaries.constants';
import {ColumnConfig, CoreWidgetConfigStore} from '@blk/explore-ui-core';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {DefinitionsStore} from '@stores/definitions.store';
import {NotificationService} from '@services/notification';
import {
    ColumnOptionService,
    ColumnSet
} from '@blk/explore-ui-column-option';
import {Observable, of} from 'rxjs';

describe('MaximizeAlphaScoreComponent', () => {
    let component: MaximizeAlphaScoreComponent;
    let fixture: ComponentFixture<MaximizeAlphaScoreComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [MaximizeAlphaScoreComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NotificationService, useValue: {error: jest.fn()}},
                {
                    provide: ColumnOptionService, useValue: {
                        isSingleChildColumn$: jest.fn((): Observable<any> => {
                            return of({
                                data: true
                            });
                        })
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(MaximizeAlphaScoreComponent);
        component = fixture.componentInstance;
        const dummyInputs = {'customCalculationColumn': {
                'restrictedOptoColumnOptions': {
                    'sections': [
                        'columnBreakdown',
                        'formatAndScaling',
                        'highlight',
                        'customColumnTitle',
                        'aggregation',
                        'customAggregation'
                    ]
                }
            }};

        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(dummyInputs);
        const constraintDef1: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'type1',
            title: 'title1',
            group: 'group1',
            isConstraintOnly: false,
            constraintType: 'SECTOR_CONSTRAINT'
        });
        const constraintDef2: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'type2',
            title: 'title2',
            group: 'group2',
            isConstraintOnly: true,
            constraintType: 'SECTOR_CONSTRAINT'
        });
        DefinitionsStore.optimizationConstraint = [constraintDef1, constraintDef2];
        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.optoConstraintType).toBe(SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY.subType);
        expect(component.restrictedColumnOptions.sections).not.toContain('customColumnTitle');
    });

    it('closeColumnMeasuresModal', () => {
        const spyForEmit = jest.spyOn(component.objectiveMeasuresClosed, 'emit');
        component.closeColumnMeasuresModal(false);
        expect(spyForEmit).toHaveBeenCalledWith(undefined);
        (component.inputs.get('columns') as ColumnSet).columns = [new ColumnConfig({
            columnType: 'type',
            columnTag: 'tag',
            isConstraintOnly: false,
            isVisible: true,
        })];
        component.closeColumnMeasuresModal(true);
        expect(spyForEmit).toHaveBeenCalledWith(component.inputs);
    });

    it('closeColumnMeasuresModal with error message', () => {
        const spyForEmit = jest.spyOn(component.objectiveMeasuresClosed, 'emit');
        const columnOptionsServiceMock = new ColumnOptionService(null);
        columnOptionsServiceMock.isSingleChildColumn$ = jest.fn((): Observable<any> => {
            return of({
                data: false
            });
        });
        component['columnOptionsService'] = columnOptionsServiceMock;
        (component.inputs.get('columns') as ColumnSet).columns = [new ColumnConfig({
            columnType: 'type',
            columnTag: 'tag',
            isConstraintOnly: false,
            isVisible: true,
        })];
        component.closeColumnMeasuresModal(true);
        expect(spyForEmit).toHaveBeenCalledTimes(0);
    });

    it('should not add columns with isConstraintOnly true', () => {
        expect(component.columnTree.length).toBe(1);
    });
});
