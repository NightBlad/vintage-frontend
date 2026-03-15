import { HttpErrorResponse } from '@angular/common/http';
export function resolveAuthErrorMessage(error: unknown, fallback: string): string {
  const lockMessage = 'Tài khoản đã bị khóa';
  const invalidEmailMessage = 'Email không hợp lệ.';
  const duplicateUsernameMessage = 'Tên đăng nhập đã tồn tại.';
  const duplicateEmailMessage = 'Email đã được sử dụng.';
  const invalidPhoneMessage = 'Số điện thoại không đúng định dạng (VD: 0901234567).';
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  const rawPayload = error.error as Record<string, unknown> | string | null;
  const payload = rawPayload && typeof rawPayload === 'object' ? rawPayload : null;
  const code = String(payload?.['code'] ?? payload?.['errorCode'] ?? '').toUpperCase();
  const statusText = String(payload?.['status'] ?? '').toUpperCase();
  const messageRaw = String(payload?.['message'] ?? rawPayload ?? '');
  const message = messageRaw.toLowerCase();
  const violations = payload?.['violations'];
  if (Array.isArray(violations)) {
    const phoneViolation = violations.find(v => {
      if (!v || typeof v !== 'object') {
        return false;
      }
      const record = v as Record<string, unknown>;
      const property = String(record['propertyPath'] ?? '').toLowerCase();
      const violationMessage = String(record['interpolatedMessage'] ?? record['message'] ?? '').toLowerCase();
      return property === 'phone' || violationMessage.includes('số điện thoại') || violationMessage.includes('phone');
    });
    if (phoneViolation) {
      return invalidPhoneMessage;
    }
  }
  const isLocked =
    error.status === 423 ||
    (error.status === 403 && (code.includes('LOCK') || message.includes('locked') || message.includes('bị khóa'))) ||
    code.includes('LOCK') ||
    statusText.includes('LOCK') ||
    message.includes('locked') ||
    message.includes('bị khóa');
  if (isLocked) {
    return lockMessage;
  }
  const isInvalidEmail =
    code.includes('EMAIL_INVALID') ||
    code.includes('INVALID_EMAIL') ||
    ((message.includes('email') || message.includes('e-mail')) &&
      (message.includes('invalid') || message.includes('không hợp lệ') || message.includes('format') || message.includes('định dạng')));
  if (isInvalidEmail) {
    return invalidEmailMessage;
  }
  const isDuplicate =
    error.status === 409 ||
    code.includes('DUPLICATE') ||
    code.includes('ALREADY_EXISTS') ||
    message.includes('already exists') ||
    message.includes('đã tồn tại') ||
    message.includes('duplicate') ||
    message.includes('đã được sử dụng');
  if (isDuplicate) {
    if (message.includes('username') || message.includes('tên đăng nhập')) {
      return duplicateUsernameMessage;
    }
    if (message.includes('email') || message.includes('e-mail')) {
      return duplicateEmailMessage;
    }
  }
  if ((message.includes('phone') || message.includes('số điện thoại')) &&
    (message.includes('invalid') || message.includes('không hợp lệ') || message.includes('định dạng'))) {
    return invalidPhoneMessage;
  }
  if (messageRaw.trim()) {
    return messageRaw;
  }
  return fallback;
}
