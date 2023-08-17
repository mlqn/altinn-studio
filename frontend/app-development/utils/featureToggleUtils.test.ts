import { typedLocalStorage } from 'app-shared/utils/webStorage';
import { shouldDisplayFeature } from './featureToggleUtils';

describe('featureToggle localStorage', () => {
  it('should return true if feature is enabled in the localStorage', () => {
    typedLocalStorage.setItem<string[]>('featureFlags', ['process']);
    expect(shouldDisplayFeature('process')).toBe(true);
  });

  it('should return true if featureFlag includes in feature params', () => {
    typedLocalStorage.setItem<string[]>('featureFlags', ['demo', 'process']);
    expect(shouldDisplayFeature('process')).toBe(true);
  });

  it('should return false if feature is not enabled in the localStorage', () => {
    typedLocalStorage.setItem<string[]>('featureFlags', ['demo']);
    expect(shouldDisplayFeature('process')).toBe(false);
  });

  it('should return false if feature is not enabled in the localStorage', () => {
    expect(shouldDisplayFeature('process')).toBe(false);
  });
});

describe('featureToggle url', () => {
  it('should return true if feature is enabled in the url', () => {
    window.history.pushState({}, 'PageUrl', '/?featureFlags=process');
    expect(shouldDisplayFeature('process')).toBe(true);
  });

  it('should return true if featureFlag includes in feature params', () => {
    window.history.pushState({}, 'PageUrl', '/?featureFlags=demo,process');
    expect(shouldDisplayFeature('process')).toBe(true);
  });

  it('should return false if feature is not included in the url', () => {
    window.history.pushState({}, 'PageUrl', '/?featureFlags=demo');
    expect(shouldDisplayFeature('process')).toBe(false);
  });

  it('should return false if feature is not included in the url', () => {
    window.history.pushState({}, 'PageUrl', '/');
    expect(shouldDisplayFeature('process')).toBe(false);
  });
});