import { getCountryNameByCode } from './countries.constant';

describe('getCountryNameByCode', () => {
  it('should return the correct country name for a valid code', () => {
    expect(getCountryNameByCode('AR')).toBe('Argentina');
    expect(getCountryNameByCode('MX')).toBe('México');
    expect(getCountryNameByCode('CO')).toBe('Colombia');
  });

  it('should return null for an invalid code', () => {
    expect(getCountryNameByCode('XX')).toBeNull();
    expect(getCountryNameByCode('')).toBeNull();
    expect(getCountryNameByCode('123')).toBeNull();
  });
});
