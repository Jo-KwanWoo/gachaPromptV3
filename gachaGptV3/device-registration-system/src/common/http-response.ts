export const ok = (message: string, data: any = {}) => ({
  status: 'success',
  message,
  data,
});