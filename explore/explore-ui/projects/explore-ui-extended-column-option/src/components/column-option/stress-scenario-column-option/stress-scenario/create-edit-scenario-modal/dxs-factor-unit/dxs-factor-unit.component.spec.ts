import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DxsFactorUnitComponent } from './dxs-factor-unit.component';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';
import {ImpliedShockScenario} from '../../../../../../models/scenario-types/implied-shock-scenario.model';
import {SimpleChanges} from '@angular/core';

describe('DxsFactorUnitComponent', () => {
    let component: DxsFactorUnitComponent;
    let fixture: ComponentFixture<DxsFactorUnitComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ DxsFactorUnitComponent ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DxsFactorUnitComponent);
        component = fixture.componentInstance;
        component.shockScenario = {
            dxsShockUnit: ScenarioConstants.DXS_SHOCK_UNIT.SPREAD,
        }  as unknown as ImpliedShockScenario;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.dxsShockUnitModes).toBeDefined();
    });

    it('test method onDxsFactorUnitChanged', () => {
        jest.spyOn(component.valueChangedEmitter, 'emit');
        component.onDxsFactorUnitChanged('x');
        expect(component.shockScenario.dxsShockUnit).toEqual('x');
        expect(component.valueChangedEmitter.emit).toHaveBeenCalled();
    });

    it('should test ngOnChanges', () => {
        const changes = {
            isDxsShockUnitReadOnly: {
                firstChange: false,
            },
        } as unknown as SimpleChanges;
        component.isDxsShockUnitReadOnly = true;
        component.ngOnChanges(changes);
        expect(component.dxsShockUnitModes).toBeDefined();
        component.dxsShockUnitModes.forEach(mode => {
            expect(mode.checked).toBeFalsy();
        });
    });
});
