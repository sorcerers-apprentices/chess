import { TranslateService } from '@ngx-translate/core';
import {
  effect,
  inject,
  Injectable,
  InjectionToken,
  type WritableSignal,
} from '@angular/core';

type SupportedLanguageType = 'en' | 'ru';

const LANGUAGE_KEY = 'language';

export const LANGUAGE_TOKEN = new InjectionToken<WritableSignal<'en' | 'ru'>>(
  'LANGUAGE_TOKEN',
);

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  public readonly translate = inject(TranslateService);
  // protected lang = toSignal(
  //   this.translate.onLangChange.pipe(map((event) => event.lang)),
  //   {
  //     initialValue: this.translate.getCurrentLang(),
  //   },
  // );
  // public language: ModelSignal<'en' | 'ru'> = signal(this.getInitialLanguage());
  public readonly language = inject(LANGUAGE_TOKEN);
  public readonly setLanguageEffect = effect(() => {
    this.translate.use(this.language());
    localStorage.setItem(LANGUAGE_KEY, this.language());
  });

  constructor() {
    this.language.set(this.getInitialLanguage());
  }

  private getInitialLanguage(): SupportedLanguageType {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    return savedLanguage === 'ru' ? 'ru' : 'en';
  }
}
