import { TestBed } from '@angular/core/testing';

import { TextTransformerService } from './text-transformer.service';

describe('TextTransformerService', () => {
  let service: TextTransformerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextTransformerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
