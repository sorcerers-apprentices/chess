import { TranslateService } from '@ngx-translate/core';
import { Injectable, inject, signal } from '@angular/core';

type SupportedLanguageType = 'en' | 'ru';

const LANGUAGE_KEY = 'language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  public readonly isEnglish = signal<boolean>(
    this.getInitialLanguage() === 'en',
  );

  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.use(this.getInitialLanguage());
  }

  public toggleLanguage(): void {
    const newLang = this.isEnglish() ? 'ru' : 'en';
    this.translate.use(newLang);
    this.isEnglish.set(newLang === 'en');
    localStorage.setItem(LANGUAGE_KEY, newLang);
  }

  private getInitialLanguage(): SupportedLanguageType {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    return savedLanguage === 'ru' ? 'ru' : 'en';
  }
}
