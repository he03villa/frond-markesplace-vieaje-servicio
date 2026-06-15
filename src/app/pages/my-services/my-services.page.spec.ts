import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyServicesPage } from './my-services.page';

describe('MyServicesPage', () => {
  let component: MyServicesPage;
  let fixture: ComponentFixture<MyServicesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
