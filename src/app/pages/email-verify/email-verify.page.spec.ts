import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailVerifyPage } from './email-verify.page';

describe('EmailVerifyPage', () => {
  let component: EmailVerifyPage;
  let fixture: ComponentFixture<EmailVerifyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailVerifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
