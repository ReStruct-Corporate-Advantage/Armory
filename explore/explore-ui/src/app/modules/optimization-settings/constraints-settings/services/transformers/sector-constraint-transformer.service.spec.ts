import {TestBed} from '@angular/core/testing';
import {SectorConstraintTransformerService} from './sector-constraint-transformer.service';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {
    ALL_TYPE,
    ALL_VALUE,
    ONE_TYPE,
    ONE_VALUE,
    RELATIVE,
    PORTFOLIO
} from '../../constants/sector-constraint.constants';
import {CustomSector} from '@blk/explore-ui-breakdown';
import {SUB_TYPE_SECTOR_CONSTRAINTS} from '../../../constants/optimization-types.constants';
import {ColumnConfig} from '@blk/explore-ui-core';

describe('SectorConstraintTransformerService', () => {
    let service: SectorConstraintTransformerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(SectorConstraintTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return type', () => {
        expect(service.type()).toEqual(SUB_TYPE_SECTOR_CONSTRAINTS);
    });

    describe('should transform', () => {
        it('should return all value for all type', () => {
            const colConfig = new ColumnConfig();
            const constraint: Constraint = new Constraint({
                title: 'title',
                optionValues: {
                    sectorConstraintType: ALL_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    ConstraintMissingData: 'applyDNTConstraint',
                    breakdownTree: {
                        isEmpty: jest.fn(() => true)
                    }
                },
                columnConfig: colConfig,
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            });

            expect(service.transform(constraint)).toEqual({
                constraint: 'title',
                value: ALL_VALUE,
                name: undefined,
                lowerBound: 1,
                upperBound: 2,
                relaxation: true,
                isRelaxable: true,
                missingDataHandling: 'applyDNTConstraint',
                enabled: false,
                columnConfig: colConfig
            });
        });

        it('should return one value for one type', () => {
            const constraint: Constraint = new Constraint({
                title: 'title',
                optionValues: {
                    sectorConstraintType: ONE_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {
                        isEmpty: jest.fn(() => true)
                    }
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            });

            expect(service.transform(constraint)).toEqual({
                constraint: 'title',
                value: ONE_VALUE,
                name: undefined,
                lowerBound: 1,
                upperBound: 2,
                relaxation: true,
                isRelaxable: true,
                enabled: false
            });

            constraint.optionValues.sectorConstraintType = PORTFOLIO;
            expect(service.transform(constraint)).toEqual({
                constraint: 'title',
                value: 'Portfolio',
                name: undefined,
                lowerBound: 1,
                upperBound: 2,
                relaxation: true,
                isRelaxable: true,
                enabled: false
            });
        });

        it('should return undefined value for any other type', () => {
            const constraint: Constraint = new Constraint({
                title: 'title',
                optionValues: {
                    sectorConstraintType: 'other',
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {
                        isEmpty: jest.fn(() => true)
                    }
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            });

            expect(service.transform(constraint)).toEqual({
                constraint: 'title',
                value: undefined,
                name: undefined,
                lowerBound: 1,
                upperBound: 2,
                relaxation: true,
                isRelaxable: true,
                enabled: false
            });
        });

        it('should return filter name for one type with filter', () => {
            const constraint: Constraint = new Constraint({
                title: 'title',
                optionValues: {
                    sectorConstraintType: ONE_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {
                        isEmpty: jest.fn(() => true)
                    },
                    filter: {
                        title: 'filterTitle'
                    }
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            });

            expect(service.transform(constraint)).toEqual({
                constraint: 'title',
                value: ONE_VALUE,
                name: 'filterTitle',
                lowerBound: 1,
                upperBound: 2,
                relaxation: true,
                isRelaxable: true,
                enabled: false
            });
        });

        it('should return title for name for all type with custom sector breakdowns', () => {
            const constraint: Constraint = new Constraint({
                title: 'title',
                optionValues: {
                    sectorConstraintType: ALL_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {
                        isEmpty: jest.fn(() => false),
                        children: [
                            new CustomSector({
                                title: 'customSectorTitle'
                            })
                        ]
                    }
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            });

            expect(service.transform(constraint)).toEqual({
                constraint: 'title',
                value: ALL_VALUE,
                name: 'customSectorTitle',
                lowerBound: 1,
                upperBound: 2,
                relaxation: true,
                isRelaxable: true,
                enabled: false
            });
        });

        it('should return column name for name for all type with non-custom sector breakdowns', () => {
            const constraint: Constraint = new Constraint({
                title: 'title',
                optionValues: {
                    sectorConstraintType: ALL_TYPE,
                    ConstraintLowerBound: 1,
                    ConstraintUpperBound: 2,
                    breakdownTree: {
                        isEmpty: jest.fn(() => false),
                        children: [
                            {
                                columnName: 'sectorColumnName'
                            }
                        ]
                    }
                },
                relaxationValue: 1,
                isRelaxable: true,
                enabled: false
            });

            expect(service.transform(constraint)).toEqual({
                constraint: 'title',
                value: ALL_VALUE,
                name: 'sectorColumnName',
                lowerBound: 1,
                upperBound: 2,
                relaxation: true,
                isRelaxable: true,
                enabled: false
            });
        });
    });

    it('should return column name from the breakdown title', () => {
        const constraint: Constraint = new Constraint({
            title: 'title',
            optionValues: {
                sectorConstraintType: ALL_TYPE,
                ConstraintLowerBound: 1,
                ConstraintUpperBound: 2,
                breakdownTree: {
                    isEmpty: jest.fn(() => false),
                    title: '<abc>',
                    children: [
                        {
                            columnName: 'sectorColumnName'
                        }
                    ]
                }
            },
            relaxationValue: 1,
            isRelaxable: true,
            enabled: false
        });

        expect(service.transform(constraint)).toEqual({
            constraint: 'title',
            value: ALL_VALUE,
            name: 'abc',
            lowerBound: 1,
            upperBound: 2,
            relaxation: true,
            isRelaxable: true,
            enabled: false
        });
    });

    it('should return relative upper lower bound values', () => {
        const constraint: Constraint = new Constraint({
            title: 'title',
            optionValues: {
                sectorConstraintType: ALL_TYPE,
                RelativeAbsolute: RELATIVE,
                PortBench: 'PORTFOLIO',
                LowerBoundOperators: 'ADDITION',
                ConstraintLowerBound: 1,
                UpperBoundOperators: 'MULTIPLICATION',
                ConstraintUpperBound: 2,
                breakdownTree: {
                    isEmpty: jest.fn(() => false),
                    title: '<abc>',
                    children: [
                        {
                            columnName: 'sectorColumnName'
                        }
                    ]
                }
            },
            relaxationValue: 1,
            isRelaxable: true,
            enabled: false
        });

        expect(service.transform(constraint)).toEqual({
            constraint: 'title',
            value: ALL_VALUE,
            name: 'abc',
            lowerBound: 'PORTFOLIO + 1',
            upperBound: 'PORTFOLIO x 2',
            relaxation: true,
            isRelaxable: true,
            enabled: false
        });
    });

});
