import { dismissToast, pushToast, toastReducer } from '@/store/slices/toast-slice';
import { TOAST_DEFAULT_DURATION } from '@/constants';

describe('toastReducer', () => {
  describe('trạng thái ban đầu', () => {
    it('khởi tạo với danh sách toasts rỗng', () => {
      expect(toastReducer(undefined, { type: 'unknown' })).toEqual({ toasts: [] });
    });
  });

  describe('pushToast', () => {
    it('thêm toast với tone và duration mặc định', () => {
      const state = toastReducer(undefined, pushToast({ message: 'Đã lưu thay đổi' }));
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toEqual({
        id: expect.any(String),
        message: 'Đã lưu thay đổi',
        tone: 'info',
        duration: TOAST_DEFAULT_DURATION,
      });
    });

    it('ghi đè tone và duration khi truyền vào', () => {
      const state = toastReducer(
        undefined,
        pushToast({ message: 'Không thành công', tone: 'error', duration: 1000 }),
      );
      expect(state.toasts[0].tone).toBe('error');
      expect(state.toasts[0].duration).toBe(1000);
    });

    it('tạo id khác nhau cho mỗi toast', () => {
      let state = toastReducer(undefined, pushToast({ message: 'thứ nhất' }));
      state = toastReducer(state, pushToast({ message: 'thứ hai' }));
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
    });
  });

  describe('dismissToast', () => {
    it('gỡ toast có id khớp và giữ lại toast khác', () => {
      let state = toastReducer(undefined, pushToast({ message: 'thứ nhất' }));
      const idToDismiss = state.toasts[0].id;
      state = toastReducer(state, pushToast({ message: 'thứ hai' }));
      state = toastReducer(state, dismissToast(idToDismiss));
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('thứ hai');
    });

    it('không đổi state khi id không tồn tại', () => {
      const state = toastReducer(undefined, pushToast({ message: 'duy nhất' }));
      const next = toastReducer(state, dismissToast('không-tồn-tại'));
      expect(next).toEqual(state);
    });
  });
});
