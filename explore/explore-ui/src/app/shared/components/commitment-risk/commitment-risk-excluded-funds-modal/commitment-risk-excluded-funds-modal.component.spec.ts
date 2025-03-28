import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommitmentRiskExcludedFundsModalComponent} from './commitment-risk-excluded-funds-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('CommitmentRiskExcludedFundsModalComponent', () => {
    let component: CommitmentRiskExcludedFundsModalComponent;
    let fixture: ComponentFixture<CommitmentRiskExcludedFundsModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitmentRiskExcludedFundsModalComponent], schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CommitmentRiskExcludedFundsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
