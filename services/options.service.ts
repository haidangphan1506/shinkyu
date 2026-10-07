import { axios_instance } from '@/lib/axios';

export interface OptionItem {
  id: string;
  name: string;
}

// NOTE: endpoints are assumed; adjust to the real backend contract.
export const optionsService = {
  async corporates(): Promise<OptionItem[]> {
    const { data } = await axios_instance.get<OptionItem[]>('/corporates');
    return data;
  },

  async licenses(): Promise<OptionItem[]> {
    const { data } = await axios_instance.get<OptionItem[]>('/licenses');
    return data;
  },
};
