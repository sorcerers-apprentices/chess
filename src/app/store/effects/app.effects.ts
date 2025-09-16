import { GameEffects } from './game.effects';
import { UserEffects } from '@/app/store/effects/user.effects';
import { FormsEffects } from '@/app/store/effects/forms.effects';

export const appEffects = [GameEffects, UserEffects, FormsEffects];
