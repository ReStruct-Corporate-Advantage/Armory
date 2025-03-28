import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DateColumnSector, SectorConstants} from '@blk/explore-ui-breakdown';
import {DateSectorOptionsComponent} from './date-sector-options.component';

describe('DateSectorOptionsComponent', () => {
    let component: DateSectorOptionsComponent;
    let fixture: ComponentFixture<DateSectorOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DateSectorOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(DateSectorOptionsComponent);
        component = fixture.componentInstance;
        component.sectorModel = new DateColumnSector();
        fixture.detectChanges();
    });

    describe('Test sectorModel change', () => {
        let changes: SimpleChanges;

        beforeEach(() => {
            component.groupBySelectionData = undefined;
            changes = {};
        });

        it('groupByYear property is undefined', () => {
            changes.sectorModel = new SimpleChange(undefined, component.sectorModel, true);
            component.sectorModel.groupByYear = undefined;
            component.ngOnChanges(changes);
            expect(component.groupBySelectionData).toEqual([
                {
                    label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.DATE,
                    checked: true,
                    disabled: false
                },
                {
                    label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.YEAR,
                    checked: false,
                    disabled: false
                }
            ]);
        });

        it('groupByYear property is true', () => {
            changes.sectorModel = new SimpleChange(undefined, component.sectorModel, true);
            component.sectorModel.groupByYear = true;
            component.ngOnChanges(changes);
            expect(component.groupBySelectionData).toEqual([
                {
                    label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.DATE,
                    checked: false,
                    disabled: false
                },
                {
                    label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.YEAR,
                    checked: true,
                    disabled: false
                }
            ]);
        });
    });

    it('Test onGroupByChange', () => {
        component.sectorModel.groupByYear = false;
        component.onGroupByChange({detail: {value: {label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.YEAR}}} as any);
        expect(component.sectorModel.groupByYear).toBeTruthy();
        component.onGroupByChange({detail: {value: {label: SectorConstants.DATE_COLUMN_SECTOR_GROUP_BY.DATE}}} as any);
        expect(component.sectorModel.groupByYear).toBeFalsy();
    });
});
