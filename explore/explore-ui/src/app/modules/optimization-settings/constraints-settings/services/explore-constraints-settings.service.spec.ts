import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ExploreConstraintsSettingsService} from './explore-constraints-settings.service';
import {DefinitionsStore} from '../../../../stores';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {of} from 'rxjs';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {ConstraintOptionNumberComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-number/constraint-option-number.component';
import {ALL_TYPE, ONE_TYPE, RELATIVE} from '../constants/sector-constraint.constants';
import {Dictionary} from 'lodash';
import {ConstraintOptionTypeKey} from '../enums/constraint-option-type-key.enum';
import {SUB_TYPE_FACTOR_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {ColumnOptionAttribute, ColumnOptionMetaDataInterface} from '@blk/explore-ui-core';
import {ColumnOptionService} from '@blk/explore-ui-column-option';

describe('ExploreConstraintsSettingsService', () => {
    let service: ExploreConstraintsSettingsService;
    let columnOptionService: ColumnOptionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: ColumnOptionService,
                useValue: {
                    fetchColumnOptions$: jest.fn()
                }
            }]
        });

        service = TestBed.inject(ExploreConstraintsSettingsService);
        columnOptionService = TestBed.inject(ColumnOptionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create constraint measures', () => {
        const constraintDef1: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'type1',
            title: 'title1',
            group: 'group1'
        });
        const constraintDef2: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'type2',
            title: 'title2',
            group: 'group2'
        });
        const constraintDef3: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'type1',
            title: 'title3',
            group: 'group1'
        });
        const constraintDef4: OptimizationConstraint = new OptimizationConstraint({
            constraintType: 'type1',
            title: 'title4',
            group: 'group3'
        });
        DefinitionsStore.optimizationConstraint = [constraintDef1, constraintDef2, constraintDef3, constraintDef4];

        expect(service.createConstraintMeasures('type1')).toEqual([
            {
                'children': [
                    {
                        'children': null,
                        'eventData': {
                            'constraintType': 'type1',
                            'dataType': 'DOUBLE',
                            'groups': [
                                'group1'
                            ],
                            'isGroupable': true,
                            'isNotSupportedInCustomCal': false,
                            'isRASColumn': false,
                            'forTopdown': false,
                            'isEATBreakdownDefinition': false,
                            'isRelaxable': false,
                            'isStaticColumn': false,
                            'isSubtotalable': true,
                            'isVisible': true,
                            'strippedName': 'title1',
                            'title': 'title1'
                        },
                        'isLearnLink': false,
                        'isSelected': undefined,
                        'label': 'title1',
                        'type': 'column',
                        'uid': 'undefined_undefined'
                    },
                    {
                        'children': null,
                        'eventData': {
                            'constraintType': 'type1',
                            'dataType': 'DOUBLE',
                            'groups': [
                                'group1'
                            ],
                            'isGroupable': true,
                            'isNotSupportedInCustomCal': false,
                            'isRASColumn': false,
                            'forTopdown': false,
                            'isEATBreakdownDefinition': false,
                            'isRelaxable': false,
                            'isStaticColumn': false,
                            'isSubtotalable': true,
                            'isVisible': true,
                            'strippedName': 'title3',
                            'title': 'title3'
                        },
                        'isLearnLink': false,
                        'isSelected': undefined,
                        'label': 'title3',
                        'type': 'column',
                        'uid': 'undefined_undefined'
                    }
                ],
                'eventData': undefined,
                'isLearnLink': undefined,
                'isSelected': undefined,
                'label': 'group1',
                'type': 'group',
                'uid': 'group1'
            },
            {
                'children': [
                    {
                        'children': null,
                        'eventData': {
                            'constraintType': 'type1',
                            'dataType': 'DOUBLE',
                            'groups': [
                                'group3'
                            ],
                            'isGroupable': true,
                            'isNotSupportedInCustomCal': false,
                            'isRASColumn': false,
                            'forTopdown': false,
                            'isEATBreakdownDefinition': false,
                            'isRelaxable': false,
                            'isStaticColumn': false,
                            'isSubtotalable': true,
                            'isVisible': true,
                            'strippedName': 'title4',
                            'title': 'title4'
                        },
                        'isLearnLink': false,
                        'isSelected': undefined,
                        'label': 'title4',
                        'type': 'column',
                        'uid': 'undefined_undefined'
                    }
                ],
                'eventData': undefined,
                'isLearnLink': undefined,
                'isSelected': undefined,
                'label': 'group3',
                'type': 'group',
                'uid': 'group3'
            }
        ]);
    });

    describe('should create constraint', () => {
        it('should return constraint with no options when no options fetched', fakeAsync(() => {
            const fetchColumnOptionsSpy = jest.spyOn(columnOptionService, 'fetchColumnOptions$');
            fetchColumnOptionsSpy.mockReturnValue(of([]));
            const constraintTag = 'tag';
            const constraintDefinition: OptimizationConstraint = new OptimizationConstraint({
                columnTag: constraintTag,
                constraintType: 'type',
                title: 'title',
                group: 'group',
                isRelaxable: true
            });

            service.createConstraint$(constraintDefinition).subscribe((constraint: Constraint) => {
                const expectedConstraint: Constraint = new Constraint({
                    constraintTag,
                    constraintType: 'type',
                    dataType: 'DOUBLE',
                    title: 'title',
                    group: 'group',
                    isRelaxable: true,
                    relaxationValue: 0,
                    enabled: true
                });
                expectedConstraint.constraintOptions = [];
                expect(constraint).toEqual(expectedConstraint);
            });
            tick();
            expect(fetchColumnOptionsSpy).toHaveBeenCalledTimes(1);
            expect(fetchColumnOptionsSpy).toHaveBeenCalledWith([{
                colTag: constraintTag,
                columnOptionType: 'type',
                use: 'ALL'
            }]);
        }));

        it('should return constraint with options when options fetched', fakeAsync(() => {
            const constraintOptions: ColumnOptionMetaDataInterface[] = [{
                columnOptionKey: 'columnOptionKey',
                columnOptionTitle: 'columnOptionTitle',
                columnOptionConfigType: 'columnOptionConfigType',
                columnOptionAttributes: []
            }];
            const fetchColumnOptionsSpy = jest.spyOn(columnOptionService, 'fetchColumnOptions$');
            fetchColumnOptionsSpy.mockReturnValue(of([{
                options: constraintOptions
            } as any]));
            const constraintTag = 'tag';
            const constraintDefinition: OptimizationConstraint = new OptimizationConstraint({
                columnTag: constraintTag,
                constraintType: 'type',
                title: 'title',
                group: 'group',
                isRelaxable: true
            });

            service.createConstraint$(constraintDefinition).subscribe((constraint: Constraint) => {
                const expectedConstraint: Constraint = new Constraint({
                    constraintTag,
                    constraintType: 'type',
                    dataType: 'DOUBLE',
                    title: 'title',
                    group: 'group',
                    isRelaxable: true,
                    relaxationValue: 0,
                    enabled: true
                });
                expectedConstraint.constraintOptions = constraintOptions;
                expect(constraint).toEqual(expectedConstraint);
            });
            tick();
            expect(fetchColumnOptionsSpy).toHaveBeenCalledTimes(1);
            expect(fetchColumnOptionsSpy).toHaveBeenCalledWith([{
                colTag: constraintTag,
                columnOptionType: 'type',
                use: 'ALL'
            }]);
        }));
    });

    describe('should get constraint options component', () => {
        it('should get valid component', () => {
            expect(service.getConstraintOptionComponent(ConstraintOptionTypeKey.NUMBER)).toEqual(ConstraintOptionNumberComponent);
        });

        it('should return undefined for unsupported component', () => {
            expect(service.getConstraintOptionComponent('test')).toBeUndefined();
        });
    });

    describe('should return whether constraint option is visible', () => {
        it('should return true if filter component and one sector type', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.FILTER, {sectorConstraintType: ONE_TYPE})).toBe(true);
        });

        it('should return true if filter component and not one sector type', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.FILTER, {sectorConstraintType: ALL_TYPE})).toBe(true);
        });

        it('should return true if breakdown component and all sector type', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.BREAKDOWN, {sectorConstraintType: ALL_TYPE})).toBe(true);
        });

        it('should return false if breakdown component and not all sector type', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.BREAKDOWN, {sectorConstraintType: ONE_TYPE})).toBe(false);
        });

        it('should return true if relative port bench component and bound type relative', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.RELATIVE_PORT_BENCH, {RelativeAbsolute: RELATIVE})).toBe(true);
        });

        it('should return false if relative port bench component and bound type absolute', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.RELATIVE_PORT_BENCH, {sectorConstraintType: 'ABSOLUTE'})).toBe(false);
        });

        it('should return true if relative bounds component and bound type relative', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.RELATIVE_BOUNDS, {RelativeAbsolute: RELATIVE})).toBe(true);
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.EFFICIENT_ENABLED_RELATIVE_BOUNDS, {RelativeAbsolute: RELATIVE})).toBe(true);
        });

        it('should return false if relative bounds component and bound type absolute', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.RELATIVE_BOUNDS, {sectorConstraintType: 'ABSOLUTE'})).toBe(false);
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.EFFICIENT_ENABLED_RELATIVE_BOUNDS, {sectorConstraintType: 'ABSOLUTE'})).toBe(false);
        });

        it('should return true if efficient enabled bounds component and bound type absolute', () => {
            expect(service.isConstraintOptionVisible(ConstraintOptionTypeKey.EFFICIENT_ENABLED_BOUNDS, {sectorConstraintType: 'ABSOLUTE'})).toBe(true);
        });

        it('should return true by default', () => {
            expect(service.isConstraintOptionVisible('other', {})).toBe(true);
        });
    });

    it('should get constraint option types', () => {
        const constraint: Constraint = new Constraint();
        const optionValues: Dictionary<any> = {key: 'val'};
        const optionAttributes: ColumnOptionAttribute[] = [{
            title: 'title',
            key: 'key'
        }] as any;
        constraint.constraintOptions = [{
            columnOptionKey: 'type',
            columnOptionAttributes: optionAttributes
        }];
        constraint.optionValues = optionValues;
        expect(service.getConstraintOptionTypes(constraint)).toEqual({
            optionTypes: [{
                type: 'type',
                optionAttributes
            }],
            optionValues
        });
    });

    it('should update option values', () => {
        const constraint = new Constraint();
        constraint.constraintOptions = [];
        expect(service.updateOptionValues(constraint, 'key', 'value')).toEqual({
            key: 'value'
        });
        expect(constraint.optionValues).toEqual({
            key: 'value'
        });
    });

    it('should return true if is ungrouped constraint', () => {
        expect(service.isUnGroupedConstraintOptionComponent('breakdownTree')).toBe(true);
    });

    it('should update option values for quickFactorBlock', () => {
        const constraint = new Constraint();
        constraint.constraintType = SUB_TYPE_FACTOR_CONSTRAINTS;
        constraint.constraintOptions = [];
        constraint.optionValues = {
            quickFactorBlock: 'value'
        };
        expect(service.updateOptionValues(constraint, 'factorTagList', 'abc')).toEqual({
            quickFactorBlock: '',
            factorTagList: 'abc'
        });
        expect(constraint.optionValues).toEqual({
            quickFactorBlock: '',
            factorTagList: 'abc'
        });
    });

    it('should update constraint enabled', () => {
        const constraint = new Constraint();
        constraint.enabled = undefined;
        service.updateConstraintEnabled(constraint, true);
        expect(constraint.enabled).toBe(true);
    });

    describe('should update constraint field', () => {
        it('should set relaxation value to 1', () => {
            const constraint = new Constraint();
            constraint.relaxationValue = undefined;
            service.updateConstraintField(constraint, undefined, true);
            expect(constraint.relaxationValue).toBe(1);
        });

        it('should set relaxation value to 0', () => {
            const constraint = new Constraint();
            constraint.relaxationValue = undefined;
            service.updateConstraintField(constraint, undefined, false);
            expect(constraint.relaxationValue).toBe(0);
        });
    });

    it('should get constraint title', () => {
        const constraint = new Constraint();
        constraint.title = 'title';
        expect(service.getConstraintTitle(constraint)).toBe('title');
    });

    describe('should return whether constraint options load is required', () => {
        it('should require load if no constraint options', () => {
            const constraint: Constraint = new Constraint();
            constraint.constraintOptions = undefined;
            expect(service.requiresConstraintOptionsLoad(constraint)).toBe(true);
        });

        it('should require load if constraint options empty', () => {
            const constraint: Constraint = new Constraint();
            constraint.constraintOptions = [];
            expect(service.requiresConstraintOptionsLoad(constraint)).toBe(true);

        });

        it('should not require load if constraint options populated', () => {
            const constraint: Constraint = new Constraint();
            constraint.constraintOptions = [{}];
            expect(service.requiresConstraintOptionsLoad(constraint)).toBe(false);
        });
    });

    it('should load constraint options', (done: any) => {
        const constraintTag = 'tag';
        const constraintOptions: ColumnOptionMetaDataInterface[] = [{
            columnOptionKey: 'key'
        }] as any;
        const fetchColumnOptionsSpy = jest.spyOn(columnOptionService, 'fetchColumnOptions$');
        fetchColumnOptionsSpy.mockReturnValue(of([{options: constraintOptions}]) as any);
        const constraint: Constraint = new Constraint();
        constraint.constraintTag = 'tag';

        service.loadConstraintOptions$(constraint).subscribe((result: boolean) => {
            expect(result).toBe(true);
            expect(constraint.constraintOptions).toEqual(constraintOptions);
            expect(fetchColumnOptionsSpy).toHaveBeenCalledTimes(1);
            expect(fetchColumnOptionsSpy).toHaveBeenCalledWith([{colTag: constraintTag, use: 'ALL'}]);
            done();
        });
    });
});
