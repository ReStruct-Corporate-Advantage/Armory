import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommitmentRiskExcludedFundsComponent} from './commitment-risk-excluded-funds.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('CommitmentRiskExcludedFundsComponent', () => {
    let component: CommitmentRiskExcludedFundsComponent;
    let fixture: ComponentFixture<CommitmentRiskExcludedFundsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitmentRiskExcludedFundsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CommitmentRiskExcludedFundsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
