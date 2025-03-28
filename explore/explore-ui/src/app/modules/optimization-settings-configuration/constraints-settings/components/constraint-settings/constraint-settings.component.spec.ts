import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ConstraintSettingsComponent} from './constraint-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChanges} from '@angular/core';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {BehaviorSubject, of} from 'rxjs';
import {Dictionary} from 'lodash';
import {CONSTRAINTS_SETTINGS_SERVICE} from '../../tokens/constraints-settings-service.token';
import {CONSTRAINT_TRANSFORMER_SERVICE} from '../../tokens/constraint-transformer-service.token';
import {ConstraintsSettingsService} from '../../interfaces/constraints-settings-service.interface';
import {ConstraintTransformerService} from '../../interfaces/constraint-transformer-service.interface';
import {ColumnUtils} from '@utils/column.utils';
import {NotificationService} from '@services/notification';
import {TestScheduler} from 'rxjs/testing';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {SUB_TYPE_FACTOR_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {CompositionUtils} from '@utils/composition.utils';

describe('ConstraintSettingsComponent', () => {
    let component: ConstraintSettingsComponent<any, any, any>;
    let fixture: ComponentFixture<ConstraintSettingsComponent<any, any, any>>;
    let constraintsSettingsService: ConstraintsSettingsService<any, any>;
    let constraintTransformerService: ConstraintTransformerService<any>;
    let notificationService: NotificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{
                provide: CONSTRAINTS_SETTINGS_SERVICE,
                useValue: {
                    createConstraint$: jest.fn(),
                    updateConstraintEnabled: jest.fn(),
                    updateConstraintField: jest.fn(),
                    requiresConstraintOptionsLoad: jest.fn(),
                    loadConstraintOptions$: jest.fn()
                }
            }, {
                provide: CONSTRAINT_TRANSFORMER_SERVICE,
                useValue: {
                    transform: jest.fn()
                }
            }, {
                provide: NotificationService,
                useValue: {
                    error: jest.fn(),
                    message: jest.fn()
                }
            }]
        });

        fixture = TestBed.createComponent(ConstraintSettingsComponent);
        component = fixture.componentInstance;
        component.summary = {} as any;
        component.constraints = [];
        constraintsSettingsService = TestBed.inject(CONSTRAINTS_SETTINGS_SERVICE);
        constraintTransformerService = TestBed.inject(CONSTRAINT_TRANSFORMER_SERVICE);
        notificationService = TestBed.inject(NotificationService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set constraint measures and create rows on init', (done: any) => {
        component.summary = {subType: 'type'} as any;
        const constraintMeasures: AuxAdvancedTreeListInterface[] = [{
            label: 'test'
        }];
        jest.spyOn(ColumnUtils, 'createConstraintMeasures').mockReturnValue(constraintMeasures);
        const constraint: any = {constraintKey: 'constraintVal'};
        const transformSpy = jest.spyOn(constraintTransformerService, 'transform');
        transformSpy.mockReturnValue({key: 'val'});
        component.constraints = [constraint];

        component.ngOnChanges({} as any as SimpleChanges);
        expect(component.constraintMeasures).toEqual(constraintMeasures);
        expect(component.rows.length).toBe(1);
        component.rows[0].subscribe((row: Dictionary<any>) => {
            expect(row).toEqual({key: 'val'});
            done();
        });
        expect(transformSpy).toHaveBeenCalledTimes(1);
        expect(transformSpy).toHaveBeenCalledWith(constraint, 'type');
    });

    it('should clearSelection() when flag set to true', () => {
        component.summary = {subType: 'type'} as any;
        const constraint: any = {constraintKey: 'constraintVal'};
        const componentSpy = jest.spyOn(component, 'clearSelection');
        component.constraints = [constraint];

        component.isClearSelection = true;
        component.ngOnChanges({} as any as SimpleChanges);
        expect(component.rows.length).toBe(1);
        expect(componentSpy).toHaveBeenCalledTimes(1);
        expect(component.selectedConstraint).toBe(undefined);
    });

    describe('should handle double click', () => {
        it('should no nothing when no event data', () => {
            const createConstraintSpy = jest.spyOn(constraintsSettingsService, 'createConstraint$');
            component.onDoubleClicked({
                detail: {value: {}}
            } as any);
            expect(createConstraintSpy).not.toHaveBeenCalled();
        });

        it('should not create new constraint if existing portfolio constraint is selected', () => {
            const createConstraintSpy = jest.spyOn(constraintsSettingsService, 'createConstraint$');
            component.constraints = [{constraintTag: 'allow_short_position'}];
            const loadConstraintOptionsSpy = jest.spyOn(constraintsSettingsService, 'loadConstraintOptions$');
            loadConstraintOptionsSpy.mockReturnValue(of(true));
            component.onDoubleClicked({
                detail: {value: {eventData: {constraintType: 'PORTFOLIO_CONSTRAINT', columnTag: 'allow_short_position'}}}
            } as any);
            expect(createConstraintSpy).not.toHaveBeenCalled();
        });

        it('should add row and mark as selected when event data', fakeAsync(() => {
            const constraintDefinition: any = {defKey: 'defVal'};
            const createConstraintSpy = jest.spyOn(constraintsSettingsService, 'createConstraint$');
            const constraint: any = {constraintKey: 'constraintVal', constraintType: 'constraintType', constraintTag: 'abc'};
            createConstraintSpy.mockReturnValue(of(constraint));
            const transformSpy = jest.spyOn(constraintTransformerService, 'transform');
            transformSpy.mockReturnValue({key: 'val'});
            component.summary = {subType: 'type'} as any;

            component.onDoubleClicked({
                detail: {value: {eventData: constraintDefinition}}
            } as any);
            tick();
            expect(component.constraints).toEqual([constraint]);
            expect(component.rows.length).toBe(1);
            component.rows[0].subscribe((row: Dictionary<any>) => {
                expect(row).toEqual({key: 'val'});
            });
            tick();
            expect(component.selectedConstraint).toBe(constraint);
            expect(component.selectedConstraintIndex).toBe(0);
            expect(component.loadingConstraintOptions).toBe(false);
            expect(transformSpy).toHaveBeenCalledTimes(1);
            expect(transformSpy).toHaveBeenCalledWith(constraint, 'type');
        }));
    });

    it('should set enabled', (done: any) => {
        const constraint: any = {constraintKey: 'constraintVal'};
        component.constraints = [constraint];
        component.rows = [new BehaviorSubject({key: 'val'})];
        const transformSpy = jest.spyOn(constraintTransformerService, 'transform');
        transformSpy.mockReturnValue({enabled: true});
        component.summary = {subType: 'type'} as any;
        const updateConstraintEnabledSpy = jest.spyOn(constraintsSettingsService, 'updateConstraintEnabled');

        component.onEnabled({index: 0, value: true});
        expect(updateConstraintEnabledSpy).toHaveBeenCalledTimes(1);
        expect(updateConstraintEnabledSpy).toHaveBeenCalledWith(component.constraints[0], true);
        expect(component.rows.length).toBe(1);
        component.rows[0].subscribe((row: Dictionary<any>) => {
            expect(row).toEqual({enabled: true});
            done();
        });
        expect(transformSpy).toHaveBeenCalledTimes(1);
        expect(transformSpy).toHaveBeenCalledWith(constraint, 'type');
    });

    it('should update value on table update', (done: any) => {
        const constraint: any = {constraintKey: 'constraintVal', constraintType: 'constraintType', constraintTag: 'max_buy_size'};
        component.constraints = [constraint];
        component.rows = [new BehaviorSubject({key: 'val'})];
        const transformSpy = jest.spyOn(constraintTransformerService, 'transform');
        transformSpy.mockReturnValue({relaxation: true});
        component.summary = {subType: 'type'} as any;
        const updateConstraintFieldSpy = jest.spyOn(constraintsSettingsService, 'updateConstraintField');

        component.onTableUpdated({
            index: 0, value: {
                name: 'relaxation',
                value: true
            }
        });
        expect(updateConstraintFieldSpy).toHaveBeenCalledTimes(1);
        expect(updateConstraintFieldSpy).toHaveBeenCalledWith(component.constraints[0], 'relaxation', true);
        expect(component.rows.length).toBe(1);
        component.rows[0].subscribe((row: Dictionary<any>) => {
            expect(row).toEqual({relaxation: true});
            done();
        });
        expect(transformSpy).toHaveBeenCalledTimes(1);
        expect(transformSpy).toHaveBeenCalledWith(constraint, 'type');
    });

    it('should update value on table update based on constraint Tag (testing assetBuy and assetSell dependeny)', (done: any) => {
        const buyConstraint: any = {constraintKey: 'constraintVal', constraintType: 'constraintType', constraintTag: 'max_buy_size'};
        const sellConstraint: any = {constraintKey: 'constraintVal', constraintType: 'constraintType', constraintTag: 'max_sell_size'};
        component.constraints = [buyConstraint, sellConstraint];
        component.rows = [new BehaviorSubject({key: 'val'})];
        const transformSpy = jest.spyOn(constraintTransformerService, 'transform');
        transformSpy.mockReturnValue({relaxation: true});
        component.summary = {subType: 'type'} as any;
        const updateConstraintFieldSpy = jest.spyOn(constraintsSettingsService, 'updateConstraintField');

        component.onTableUpdated({
            index: 0, value: {
                name: 'relaxation',
                value: true
            }
        });

        expect(updateConstraintFieldSpy).toHaveBeenCalledTimes(2);
        expect(notificationService.message).toHaveBeenCalledTimes(1);
        expect(updateConstraintFieldSpy).toHaveBeenCalledWith(component.constraints[0], 'relaxation', true);
        expect(updateConstraintFieldSpy).toHaveBeenCalledWith(component.constraints[1], 'relaxation', true);
        expect(component.rows.length).toBe(2);
        component.rows[0].subscribe((row: Dictionary<any>) => {
            expect(row).toEqual({relaxation: true});
            done();
        });
        expect(transformSpy).toHaveBeenCalledTimes(2);
        expect(transformSpy).toHaveBeenCalledWith(buyConstraint, 'type');
    });

    it('should update value on table update all constraints of the type', () => {
        component.constraints = [{
            'enabled': true,
            'relaxationValue': 0,
            'constraintTag': 'market_val',
            'constraintType': 'SECTOR_CONSTRAINT',
            'dataType': 'DOUBLE',
            'columnFormat': {
                'decimalPlaces': 2,
                'useThousandsSeparator': true,
                'scalingFactor': 1,
                'formatString': ':2 T:true',
                'scalable': false,
                'configType': 'numericColumnFormat'
            },
            'positionType': 'PORT',
            'isRelaxable': true,
            'group': 'Position',
            'optionValues': {
                'sectorConstraintType': 'all',
                'RelativeAbsolute': 'ABSOLUTE',
                'breakdownTree': {
                    'breakdown': {}
                }
            }
        }, {
            'enabled': true,
            'relaxationValue': 0,
            'constraintTag': 'duration',
            'constraintType': 'SECTOR_CONSTRAINT',
            'dataType': 'DOUBLE',
            'columnFormat': {
                'scalingOptions': {},
                'decimalPlaces': 2,
                'isUseThousandsSeparator': true,
                'isScalable': false,
                'scalingFactor': 1
            },
            'positionType': 'PORT',
            'isRelaxable': true,
            'group': 'Risk',
            'optionValues': {
                'sectorConstraintType': 'all',
                'RelativeAbsolute': 'ABSOLUTE',
                'breakdownTree': {
                    'breakdown': {}
                }
            }
        }, {
            'enabled': true,
            'relaxationValue': 0,
            'constraintTag': 'vol_avg_10d',
            'constraintType': 'SECTOR_CONSTRAINT',
            'dataType': 'DOUBLE',
            'columnFormat': {
                'scalingOptions': {},
                'decimalPlaces': 0,
                'isUseThousandsSeparator': true,
                'isScalable': true,
                'scalingFactor': 1
            },
            'positionType': 'ALL',
            'isRelaxable': false,
            'group': 'Security',
            'optionValues': {
                'sectorConstraintType': 'all',
                'RelativeAbsolute': 'ABSOLUTE',
                'breakdownTree': {
                    'breakdown': {}
                }
            }
        }].map(constraint => new Constraint(constraint));

        component.rows = [
            new BehaviorSubject({
                'constraint': 'Market Value',
                'value': 'All Sectors',
                'relaxation': false,
                'isRelaxable': true,
                'enabled': true
            }), new BehaviorSubject({
                'constraint': 'Duration',
                'value': 'All Sectors',
                'relaxation': false,
                'isRelaxable': true,
                'enabled': true
            }), new BehaviorSubject({
                'constraint': 'Average Daily Volume (10d)',
                'value': 'All Sectors',
                'relaxation': false,
                'isRelaxable': false,
                'enabled': true
            })
        ];

        const updateConstraintFieldSpy = jest.spyOn(constraintsSettingsService, 'updateConstraintField');
        updateConstraintFieldSpy.mockImplementation((constraint: Constraint, _field: string, value: any) => constraint.relaxationValue = value ? 1 : 0);

        component.onTableUpdated({
            'index': 1,
            'value': {
                'name': 'relaxation',
                'value': true
            }
        });

        expect(updateConstraintFieldSpy).toHaveBeenCalledTimes(3);
        expect(notificationService.message).toHaveBeenCalledTimes(1);
        expect(component.rows.every(row => !!row['relaxation']));
    });

    it('should update on options update', (done: any) => {
        const constraint: any = {constraintKey: 'constraintVal'};
        component.constraints = [constraint];
        component.selectedConstraint = constraint;
        component.selectedConstraintIndex = 0;
        component.rows = [new BehaviorSubject({key: 'val'})];
        const transformSpy = jest.spyOn(constraintTransformerService, 'transform');
        transformSpy.mockReturnValue({updated: true});
        component.summary = {subType: 'type'} as any;

        component.onOptionsUpdated();
        expect(component.rows.length).toBe(1);
        component.rows[0].subscribe((row: Dictionary<any>) => {
            expect(row).toEqual({updated: true});
            done();
        });
        expect(transformSpy).toHaveBeenCalledTimes(1);
        expect(transformSpy).toHaveBeenCalledWith(constraint, 'type');
    });

    it('should delete constraint', () => {
        const testScheduler = new TestScheduler((a, e) => expect(a).toEqual(e));

        const constraint1: any = {constraintKey: 'constraintVal1'};
        const constraint2: any = {constraintKey: 'constraintVal2'};
        const constraint3: any = {constraintKey: 'constraintVal3'};
        component.constraints = [constraint1, constraint2, constraint3];
        component.rows = [
            new BehaviorSubject({id: 1}),
            new BehaviorSubject({id: 2}),
            new BehaviorSubject({id: 3})
        ];
        component.selectedConstraint = constraint2;
        component.selectedConstraintIndex = 1;

        component.onDeleted(1);
        expect(component.constraints).toEqual([constraint1, constraint3]);
        expect(component.rows.length).toBe(2);

        testScheduler.run(() => component.rows[0].subscribe(row => expect(row).toEqual({id: 1})));
        testScheduler.run(() => component.rows[1].subscribe(row => expect(row).toEqual({id: 3})));

        expect(component.selectedConstraintIndex).toBeUndefined();
        expect(component.selectedConstraint).toBeUndefined();
    });

    describe('should set selected constraint', () => {
        it('should set selected when constraint options loaded', () => {
            const requiresConstraintOptionsLoadSpy = jest.spyOn(constraintsSettingsService, 'requiresConstraintOptionsLoad');
            requiresConstraintOptionsLoadSpy.mockReturnValue(false);
            const constraint: any = {constraintKey: 'constraintVal'};
            component.constraints = [constraint];

            component.onSelected(0);
            expect(component.selectedConstraint).toBe(constraint);
            expect(component.selectedConstraintIndex).toEqual(0);
            expect(requiresConstraintOptionsLoadSpy).toHaveBeenCalledTimes(1);
            expect(requiresConstraintOptionsLoadSpy).toHaveBeenCalledWith(constraint);
        });

        it('should load constraint options and then set selected when options not loaded', fakeAsync(() => {
            const requiresConstraintOptionsLoadSpy = jest.spyOn(constraintsSettingsService, 'requiresConstraintOptionsLoad');
            requiresConstraintOptionsLoadSpy.mockReturnValue(true);
            const loadConstraintOptionsSpy = jest.spyOn(constraintsSettingsService, 'loadConstraintOptions$');
            loadConstraintOptionsSpy.mockReturnValue(of(true));
            const constraint: any = {constraintKey: 'constraintVal'};
            component.constraints = [constraint];

            component.onSelected(0);
            tick();
            expect(component.selectedConstraint).toBe(constraint);
            expect(component.selectedConstraintIndex).toEqual(0);
            expect(requiresConstraintOptionsLoadSpy).toHaveBeenCalledTimes(1);
            expect(requiresConstraintOptionsLoadSpy).toHaveBeenCalledWith(constraint);
            expect(loadConstraintOptionsSpy).toHaveBeenCalledTimes(1);
            expect(loadConstraintOptionsSpy).toHaveBeenCalledWith(constraint);
            expect(component.loadingConstraintOptions).toBe(false);
        }));
    });

    describe('should clone the selected constraint', () => {
        it('does not clone efficient frontier enabled constraint', () => {
            component.constraints = [];
            jest.spyOn(CompositionUtils, 'checkIfConstraintInEfficientFormat').mockReturnValue(true);
            component.onCloned(0);
            expect(notificationService.error).toHaveBeenCalledTimes(1);
        });

        it('clones constraint', () => {
            component.constraints = [{
                constraintType: 'constraintType',
                constraintTag: 'abc',
                optionValues: {
                    ConstraintUpperBound: 1,
                    ConstraintLowerBound: 2
                }
            }];
            jest.spyOn(CompositionUtils, 'checkIfConstraintInEfficientFormat').mockReturnValue(false);
            component.onCloned(0);
            expect(component.constraints[0]).toEqual(component.constraints[1]);
            expect(component.selectedConstraintIndex).toBe(1);
        });
    });

    describe('updates relaxation field on the constraint to be added based on checks', () => {
        it('constraint not passed - throw error', () => {
            try  {
                component['updateConstraintValueOnAdd'](null, null)
            } catch (error) {
                expect(error).toHaveProperty('message', 'Found no constraint to update field');
            }
        });

        it('constraint is passed but does not have required constraint type', () => {
            const updateConstraintFieldSpy = jest.spyOn(constraintsSettingsService, 'updateConstraintField');
            updateConstraintFieldSpy.mockImplementation((constraint: Constraint, _field: string, value: any) => constraint.relaxationValue = value ? 1 : 0);

            let serializedConstraint: any = {constraintType: 'abd', constraintTag: 'abc'};
            let constraint: Constraint = new Constraint(serializedConstraint);
            component['updateConstraintValueOnAdd'](constraint, [new Constraint(serializedConstraint)]);
            expect(constraint['relaxationValue']).not.toBe(1);

            serializedConstraint = {constraintType: SUB_TYPE_FACTOR_CONSTRAINTS, constraintTag: 'abc'};
            constraint = new Constraint(serializedConstraint);
            component['updateConstraintValueOnAdd'](constraint, [new Constraint(serializedConstraint)]);
            expect(constraint['relaxationValue']).not.toBe(1);

            constraint = new Constraint({...serializedConstraint, isRelaxable: true});
            component['updateConstraintValueOnAdd'](constraint, [new Constraint(serializedConstraint)]);
            expect(constraint['relaxationValue']).not.toBe(1);

            component['updateConstraintValueOnAdd'](constraint, [new Constraint({...serializedConstraint, relaxationValue: 1})]);
            expect(constraint['relaxationValue']).toBe(1);
        });
    });
});
