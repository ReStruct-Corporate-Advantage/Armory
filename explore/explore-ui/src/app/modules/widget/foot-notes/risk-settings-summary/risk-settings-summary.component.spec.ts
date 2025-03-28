import {RiskSettingsSummaryComponent} from './risk-settings-summary.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';

describe('test RiskSettingsSummaryComponent', () => {
    let component: RiskSettingsSummaryComponent;
    let fixture: ComponentFixture<RiskSettingsSummaryComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ RiskSettingsSummaryComponent ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RiskSettingsSummaryComponent);
        component = fixture.componentInstance;
        component.riskSettingsSummaryDetails = {valueList: [], sourceList: []};
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('test asIsOrder', () => {
        it('if a & b both are undefined', () => {
            expect(component.asIsOrder(undefined, undefined)).toBe(1);
        });

        it('if a is undefined', () => {
            expect(component.asIsOrder(undefined, 4)).toBe(1);
        });

        it('if b is undefined', () => {
            expect(component.asIsOrder(3, undefined)).toBe(1);
        });

        it('if a and b both are defined', () => {
            expect(component.asIsOrder(3, 4)).toBe(1);
        });
    });
});
