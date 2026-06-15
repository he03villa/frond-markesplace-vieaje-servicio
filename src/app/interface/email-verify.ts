export type VerifyStatus = 'loading' | 'success' | 'already_verified' | 'invalid' | 'error';

export interface VerifyState {
  status: VerifyStatus;
  title: string;
  message: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  gradient: string;
  primaryAction: { label: string; route: string; icon: string };
  secondaryAction?: { label: string; route: string; icon: string };
}
