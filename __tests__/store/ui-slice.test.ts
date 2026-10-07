import { setSidebarCollapsed, toggleSidebarCollapsed, uiReducer } from '@/store/slices/ui-slice';

describe('uiReducer', () => {
  describe('trạng thái ban đầu', () => {
    it('khởi tạo với sidebarCollapsed bằng false', () => {
      expect(uiReducer(undefined, { type: 'unknown' })).toEqual({
        sidebarCollapsed: false,
      });
    });
  });

  describe('toggleSidebarCollapsed', () => {
    it('đảo trạng thái từ false sang true', () => {
      expect(uiReducer({ sidebarCollapsed: false }, toggleSidebarCollapsed())).toEqual({
        sidebarCollapsed: true,
      });
    });

    it('đảo trạng thái từ true sang false', () => {
      expect(uiReducer({ sidebarCollapsed: true }, toggleSidebarCollapsed())).toEqual({
        sidebarCollapsed: false,
      });
    });
  });

  describe('setSidebarCollapsed', () => {
    it('gán true khi nhận true', () => {
      expect(uiReducer({ sidebarCollapsed: false }, setSidebarCollapsed(true))).toEqual({
        sidebarCollapsed: true,
      });
    });

    it('gán false khi nhận false', () => {
      expect(uiReducer({ sidebarCollapsed: true }, setSidebarCollapsed(false))).toEqual({
        sidebarCollapsed: false,
      });
    });
  });
});
