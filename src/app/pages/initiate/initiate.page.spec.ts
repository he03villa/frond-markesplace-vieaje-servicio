import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitiatePage } from './initiate.page';

describe('InitiatePage', () => {
  let component: InitiatePage;
  let fixture: ComponentFixture<InitiatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InitiatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
