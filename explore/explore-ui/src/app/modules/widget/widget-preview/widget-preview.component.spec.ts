import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WidgetPreviewComponent} from './widget-preview.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('WidgetPreviewComponent', () => {
    let component: WidgetPreviewComponent;
    let fixture: ComponentFixture<WidgetPreviewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetPreviewComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(WidgetPreviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
