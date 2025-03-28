import {
    MaximizeAlphaStressScenarioComponent
} from '@optimization-settings/objectives-settings/components/maximize-alpha-stress-scenario/maximize-alpha-stress-scenario.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CoreDefinitionStore, NamedScenario} from '@blk/explore-ui-core';

describe('MaximizeAlphaStressScenarioComponent', () => {
    let component: MaximizeAlphaStressScenarioComponent;
    let fixture: ComponentFixture<MaximizeAlphaStressScenarioComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule],
            declarations: [MaximizeAlphaStressScenarioComponent]
        });

        fixture = TestBed.createComponent(MaximizeAlphaStressScenarioComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('tests onUpdateScenario', () => {
        jest.spyOn(component.updated, 'emit').mockImplementationOnce(_a => {});
        component.onUpdateStressScenario({detail: {value: {value: 'A'}}} as any);
        expect(component.updated.emit).toHaveBeenCalledWith({key: 'stressPnlSetting', value: 'A'});
    });

    it('should initialize Stress scenario drop down values', () => {
        expect(component.scenarios.length).toEqual(0);
        CoreDefinitionStore.namedScenarios = new Map([['Test', [{
            code: 'NC1',
            name: 'NamedScenario1'
        } as NamedScenario]]]);
        component.ngOnInit();
        expect(component.scenarios.length).toEqual(1);
    });

    it('test method openScenarioSelectionModal', () => {
        component.selectedScenario = 'abc';
        expect(component.isScenarioModalOpen).toBeFalsy();
        component.openScenarioSelectionModal();
        expect(component.isScenarioModalOpen).toBeTruthy();
        expect(component.nameScenarios[0].code).toBe('abc');
    });

    it('test method onScenarioSelectionModalClosed', () => {
        component.isScenarioModalOpen = true;
        component.nameScenarios = [new NamedScenario({ scenCode: 'abc' })];

        jest.spyOn(component.updated, 'emit');

        component.onScenarioSelectionModalClosed(true);

        expect(component.isScenarioModalOpen).toBeFalsy();
        expect(component.updated.emit).toHaveBeenCalled();

    });
});
