import { NowState } from '../types/portfolio';
import rawNow from '../../../backend/data/now.json';

export const nowData: NowState = rawNow as NowState;
