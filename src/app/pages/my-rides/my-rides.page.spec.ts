import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRidesPage } from './my-rides.page';

describe('MyRidesPage', () => {
  let component: MyRidesPage;
  let fixture: ComponentFixture<MyRidesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyRidesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
