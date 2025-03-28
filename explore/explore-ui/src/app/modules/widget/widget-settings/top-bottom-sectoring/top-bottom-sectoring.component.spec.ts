import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TopBottomSectoringComponent} from './top-bottom-sectoring.component';
import {TopBottomSectoring} from '@models/widget/inputs/top-bottom-sectoring/top-bottom-sectoring.model';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SectorModeTypeEnum} from '@enums/sector-mode-type.enum';

describe('TopBottomSectoringComponent', () => {
    let component: TopBottomSectoringComponent;
    let fixture: ComponentFixture<TopBottomSectoringComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopBottomSectoringComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopBottomSectoringComponent);
        component = fixture.componentInstance;
        component.widgetConfigInput = {} as any;
        jest.spyOn(component, 'getInput').mockReturnValue(new TopBottomSectoring());
        fixture.detectChanges();
    });

    it('should create', () => {
        jest.spyOn(component, 'getInput').mockReturnValue(new TopBottomSectoring());
        expect(component).toBeTruthy();
    });

    it('tests initializeComponent', () => {
        component.widgetInput = new TopBottomSectoring();
        component.initializeComponent();
        expect(component.sectorModeType).toBe(SectorModeTypeEnum.BOTTOM_UP);
        expect(component.displayAtGroupNode).toBeFalsy();
        expect(component.sectorModeOptions).toEqual([{
            label: SectorModeTypeEnum.BOTTOM_UP,
            eventData: SectorModeTypeEnum.BOTTOM_UP,
            checked: true
        }, {
            label: SectorModeTypeEnum.TOP_DOWN,
            eventData: SectorModeTypeEnum.TOP_DOWN,
            checked: false
        }]);
    });

    it('tests onSectorModeChanged', () => {
        component.widgetInput = new TopBottomSectoring();
        component.onSectorModeChanged({'detail': {'value': {'eventData': SectorModeTypeEnum.TOP_DOWN}}} as CustomEvent);
        expect(component.sectorModeType).toBe(SectorModeTypeEnum.TOP_DOWN);
        expect(component.widgetInput.isTopBottomSectoring).toBeTruthy();
    });

    it('tests updateDisplayAtGroupNode', () => {
        component.widgetInput = new TopBottomSectoring();
        component.updateDisplayAtGroupNode({'detail': {'value': {'checked': true}}} as CustomEvent);
        expect(component.displayAtGroupNode).toBeTruthy();
        expect(component.widgetInput.displayAtGroupNode).toBeTruthy();
    });
});
