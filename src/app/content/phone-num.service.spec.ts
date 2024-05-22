import { TestBed } from '@angular/core/testing';

import { PhoneNumService } from './phone-num.service';

describe('PhoneNumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PhoneNumService = TestBed.get(PhoneNumService);
    expect(service).toBeTruthy();
  });
});
