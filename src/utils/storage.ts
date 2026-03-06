import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'tee-union-storage' });

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER_ROLE: 'userRole',
  USER_ID: 'userId',
  EMPLOYEE_ID: 'employeeId',
  REQUIRES_PIN_CHANGE: 'requiresPinChange',
  THEME: 'theme',
} as const;

export const tokenStorage = {
  setToken: (token: string) => storage.set(KEYS.ACCESS_TOKEN, token),
  getToken: (): string | undefined => storage.getString(KEYS.ACCESS_TOKEN),
  removeToken: () => storage.delete(KEYS.ACCESS_TOKEN),

  setUser: (data: {
    userId: string;
    role: string;
    employeeId: string;
    requiresPinChange: boolean;
  }) => {
    storage.set(KEYS.USER_ID, data.userId);
    storage.set(KEYS.USER_ROLE, data.role);
    storage.set(KEYS.EMPLOYEE_ID, data.employeeId);
    storage.set(KEYS.REQUIRES_PIN_CHANGE, data.requiresPinChange);
  },

  getUser: () => ({
    userId: storage.getString(KEYS.USER_ID),
    role: storage.getString(KEYS.USER_ROLE),
    employeeId: storage.getString(KEYS.EMPLOYEE_ID),
    requiresPinChange: storage.getBoolean(KEYS.REQUIRES_PIN_CHANGE) ?? false,
  }),

  clearAll: () => storage.clearAll(),
};
