import { axios_instance } from '@/lib/axios';
import { optionsService } from '@/services';

jest.mock('../../lib/axios', () => ({
  axios_instance: { get: jest.fn() },
}));

const mockGet = axios_instance.get as jest.Mock;

describe('optionsService', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  describe('corporates', () => {
    it('gọi GET /corporates và trả về dữ liệu', async () => {
      const items = [{ id: '1', name: 'A' }];
      mockGet.mockResolvedValue({ data: items });

      await expect(optionsService.corporates()).resolves.toEqual(items);
      expect(mockGet).toHaveBeenCalledWith('/corporates');
    });
  });

  describe('licenses', () => {
    it('gọi GET /licenses và trả về dữ liệu', async () => {
      const items = [{ id: 'L1', name: 'MIT' }];
      mockGet.mockResolvedValue({ data: items });

      await expect(optionsService.licenses()).resolves.toEqual(items);
      expect(mockGet).toHaveBeenCalledWith('/licenses');
    });
  });
});
