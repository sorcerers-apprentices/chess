import '@testing-library/jest-dom';
import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { ResourceLoader } from '@angular/compiler';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

class DummyResourceLoader extends ResourceLoader {
  // <-- extends, не implements
  public override get(_url: string): Promise<string> {
    return Promise.resolve('');
  }
}

TestBed.configureCompiler({
  providers: [{ provide: ResourceLoader, useClass: DummyResourceLoader }],
});
