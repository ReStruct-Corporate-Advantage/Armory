import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddStressScenariosModalComponent } from './add-stress-scenarios-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ScenarioColumnOption} from '@blk/explore-ui-column-option';

describe('AddStressScenariosModalComponent', () => {
    let component: AddStressScenariosModalComponent;
    let fixture: ComponentFixture<AddStressScenariosModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ AddStressScenariosModalComponent ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();

        fixture = TestBed.createComponent(AddStressScenariosModalComponent);
        component = fixture.componentInstance;

        component.optionValue = new ScenarioColumnOption();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

