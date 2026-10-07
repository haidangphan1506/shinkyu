import { getFieldErrors } from '@/utils/api-validation-error';

describe('getFieldErrors', () => {
  describe('mảng field', () => {
    it('bỏ qua item null trong mảng errors', () => {
      expect(
        getFieldErrors({
          message: 'x',
          data: { errors: [null, { field: 'email', message: 'bad' }] },
        }),
      ).toEqual({ email: 'bad' });
    });

    it('giữ message đầu tiên khi field lặp lại', () => {
      expect(
        getFieldErrors({
          message: 'x',
          data: {
            errors: [
              { field: 'email', message: 'first' },
              { field: 'email', message: 'second' },
            ],
          },
        }),
      ).toEqual({ email: 'first' });
    });
  });

  describe('object field', () => {
    it('nhận message dạng chuỗi thuần', () => {
      expect(getFieldErrors({ message: 'x', data: { errors: { email: 'invalid' } } })).toEqual({
        email: 'invalid',
      });
    });

    it('bỏ qua giá trị không phải chuỗi', () => {
      expect(getFieldErrors({ message: 'x', data: { errors: { email: 42 } } })).toEqual({});
    });
  });
});
