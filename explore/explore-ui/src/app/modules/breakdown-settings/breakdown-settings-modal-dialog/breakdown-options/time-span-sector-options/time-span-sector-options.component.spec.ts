import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TimeSpanSectorOptionsComponent} from './time-span-sector-options.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {TimeSpanColumnSector} from '@blk/explore-ui-breakdown';

describe('TimeSpanSectorOptionsComponent', () => {
    let component: TimeSpanSectorOptionsComponent;
    let fixture: ComponentFixture<TimeSpanSectorOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimeSpanSectorOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(TimeSpanSectorOptionsComponent);
        component = fixture.componentInstance;
        component.sectorModel = new TimeSpanColumnSector();
        fixture.detectChanges();
    });

    describe('Test sectorModel change', () => {
        it('sectorModel is undefined', () => {
            component.sectorModel = undefined;
            component.ngOnChanges({sectorModel: new SimpleChange(undefined, undefined, true)});
            expect(component.buckets).toBeUndefined();
        });

        it('bucketBreakpoints is undefined', () => {
            component.sectorModel = new TimeSpanColumnSector();
            component.ngOnChanges({sectorModel: new SimpleChange(undefined, component.sectorModel, true)});
            expect(component.buckets).toEqual('1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30');
            expect(component.sectorModel.bucketBreakpoints).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map(String));
        });

        it('bucketBreakpoints is is defined', () => {
            component.sectorModel = new TimeSpanColumnSector();
            component.sectorModel.bucketBreakpoints = ['2', '5'];
            component.ngOnChanges({sectorModel: new SimpleChange(undefined, component.sectorModel, true)});
            expect(component.buckets).toEqual('2, 5');
        });
    });

    it('Test setDefaultBucket', () => {
        component.sectorModel = new TimeSpanColumnSector();
        component.sectorModel.bucketBreakpoints = ['2', '5'];
        component.setDefaultBucket([1, 2, 3]);
        expect(component.buckets).toEqual('1, 2, 3');
        expect(component.sectorModel.bucketBreakpoints).toEqual(['1', '2', '3']);
    });

    it('Test onBucketsUpdate', () => {
        component.sectorModel = new TimeSpanColumnSector();
        component.sectorModel.bucketBreakpoints = ['2', '5'];
        component.onBucketsUpdate({detail: {value:'1, 2,, 3'}}as any);
        expect(component.sectorModel.bucketBreakpoints).toEqual(['1', '2', '3']);
    });

});
