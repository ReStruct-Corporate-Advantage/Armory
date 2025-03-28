import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AssetStressScenarioComponent} from './asset-stress-scenario.component';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {CoreDefinitionStore} from '@blk/explore-ui-core';

describe('AssetStressScenarioComponent Test', () => {
    let component: AssetStressScenarioComponent;
    let fixture: ComponentFixture<AssetStressScenarioComponent>;

    const preCannedScenarioDef: any[] = [
        {text: 'Scenario 1', value: 'SCENE1'},
        {text: 'Scenario 2', value: 'SCENE2'}
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AssetStressScenarioComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(AssetStressScenarioComponent);
        component = fixture.componentInstance;
    });

    describe('Test ngOnInit', () => {
        describe('Test no assetStressScenario', () => {
            it('Test sectorStress disabled', fakeAsync(() => {
                expect(component.preCannedStressScenarioOptions).toBeUndefined();
                CoreDefinitionStore.preCannedStressScenarios = preCannedScenarioDef;
                component.ngOnInit();
                fixture.detectChanges();
                fixture.whenStable().then(() => {
                    const select = fixture.debugElement.nativeElement.querySelector('aux-select');
                    expect(component.availablePrecannedStressScenarios.length).toBe(3);
                    expect(component.preCannedStressScenarioOptions.length).toBe(1);
                    expect(select.attributes['is-disabled']).toBeUndefined();
                });
            }));
        });
    });

    it('onPrecannedStressScenarioChanged test', () => {
        jest.spyOn(component.assetStressScenarioSelected, 'emit').mockImplementationOnce(_a => {});
        component.onPrecannedStressScenarioChanged(null);
        expect(component.assetStressScenarioSelected.emit).toHaveBeenCalledTimes(0);
        const optionSelected = {value: 'SCENE1'} as AuxSelectOption;
        const event = {detail: {value: optionSelected}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        component.onPrecannedStressScenarioChanged(event);
        fixture.detectChanges();
        expect(component.assetStressScenarioSelected.emit).toHaveBeenCalled();
    });
});
