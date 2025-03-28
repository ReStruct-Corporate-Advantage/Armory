import {BaseDateVaryComponent} from './base-date-vary.component';
import {EconomyExposureDateVaryColumnOptionModel} from '../../../../models/column-option/economy-exposure-date-vary-column-option.model';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UiColumnOptionService} from '../../../../services/ui-column-option.service';

describe('BaseDateVaryColumnOptionsComponent', () => {
    let component: BaseDateVaryComponent;
    let fixture: ComponentFixture<BaseDateVaryComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BaseDateVaryComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: UiColumnOptionService, useValue: null}]
        });

        fixture = TestBed.createComponent(BaseDateVaryComponent);
        component = fixture.componentInstance;
    });

    it('Validate config type of the component', () => {
        jest.spyOn(component, 'onDestroy').mockImplementation(() => {});
        expect(component.getOptionValueConfigType()).toEqual(EconomyExposureDateVaryColumnOptionModel.CONFIG_TYPE);
    });
});
