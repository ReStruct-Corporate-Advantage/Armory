import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FactorDataWidgetColumnModalComponent} from './factor-data-widget-column-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('FactorDataWidgetColumnModalComponent', () => {
    let component: FactorDataWidgetColumnModalComponent;
    let fixture: ComponentFixture<FactorDataWidgetColumnModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorDataWidgetColumnModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        fixture = TestBed.createComponent(FactorDataWidgetColumnModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
