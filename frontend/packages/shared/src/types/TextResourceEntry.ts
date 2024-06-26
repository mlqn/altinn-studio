import type { TextResourceVariable } from '@altinn/text-editor/types';

export interface TextResourceDetails {
  value: string;
  variables?: TextResourceVariable[];
}

export interface TextResourceEntry extends TextResourceDetails {
  id: string;
}
