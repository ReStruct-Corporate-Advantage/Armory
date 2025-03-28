import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModellingTypesComponent} from './modelling-types.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CompositionConstants} from '@constants/composition.constants';

describe('ModellingTypesComponent', () => {
    let component: ModellingTypesComponent;
    let fixture: ComponentFixture<ModellingTypesComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ModellingTypesComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ModellingTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('test OnInit', () => {
        component.ngOnInit();
        expect(component.modellingDescription).toStrictEqual(CompositionConstants.MODELLING_TYPE_DESCRIPTION);
        expect(component.modellingLabel).toStrictEqual(CompositionConstants.MODELLING_MAIN_TYPE_LABEL);
        expect(component.modellingTypeHeader).toBe('Select a What-if Model Type');

        // for create from scratch screen
        component.useCustomPortStyling = true;
        component.ngOnInit();
        expect(component.modellingDescription).toStrictEqual(CompositionConstants.MODELLING_TYPE_DESCRIPTION_CUSTOM_PORT);
        expect(component.modellingLabel).toStrictEqual(CompositionConstants.MODELLING_MAIN_TYPE_LABEL_CUSTOM_PORT);
        expect(component.modellingTypeHeader).toBe('Select a Custom Portfolio Type');
    });
});
