import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintsSettingsComponent} from './constraints-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('ConstraintsSettingsComponent', () => {
    let component: ConstraintsSettingsComponent<any, any>;
    let fixture: ComponentFixture<ConstraintsSettingsComponent<any, any>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintsSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintsSettingsComponent);
        component = fixture.componentInstance;
        component.summariesWithValues = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('should set active index on init', () => {
        it('should pick correct index if exists', () => {
            component.summariesWithValues = [{
                summary: {
                    subType: 'subType1'
                }
            }, {
                summary: {
                    subType: 'subType2'
                }
            }] as any;
            component.activeSubType = 'subType2';

            component.ngOnInit();
            expect(component.activeIndex).toBe(1);
        });

        it('should default to first if does not exist', () => {
            component.summariesWithValues = [{
                summary: {
                    subType: 'subType1'
                }
            }, {
                summary: {
                    subType: 'subType2'
                }
            }] as any;
            component.activeSubType = 'subType3';

            component.ngOnInit();
            expect(component.activeIndex).toBe(0);
        });

        it('should clear selected constraint on tab changed', () => {
            component.summariesWithValues = [{
                summary: {
                    subType: 'subType1'
                }
            }, {
                summary: {
                    subType: 'subType2'
                }
            }] as any;
            component.activeSubType = 'subType3';

            component.activeIndex = 0;
            component.clearSelection = false;
            component.onTabSelected({detail: {uid: 1}});
            expect(component.activeIndex).toBe(1);
            expect(component.clearSelection).toBe(true);
        });
    });
});
