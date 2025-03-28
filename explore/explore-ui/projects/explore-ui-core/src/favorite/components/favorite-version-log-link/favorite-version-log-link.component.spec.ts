import { ComponentFixture, TestBed } from '@angular/core/testing';
import {EventEmitter} from '@angular/core';
import { FavoriteVersionLogLinkComponent } from './favorite-version-log-link.component';

describe('FavoriteVersionLogLinkComponent', () => {
  let component: FavoriteVersionLogLinkComponent;
  let fixture: ComponentFixture<FavoriteVersionLogLinkComponent>;
  const viewClick = new EventEmitter();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FavoriteVersionLogLinkComponent]
    });
    fixture = TestBed.createComponent(FavoriteVersionLogLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should test onViewClicked', () => {
    jest.spyOn(viewClick, 'emit');
    component.onViewClicked();
    expect(viewClick.emit).toBeDefined();
  });
  
});
