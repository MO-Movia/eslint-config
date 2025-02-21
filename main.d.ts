// @ts-check
import type { TSESLint } from '@typescript-eslint/utils';

/**
 * @param {string | undefined | null} app prefix to use for the angular library.
 * For non-Angular projects, Angular rules are excluded if not provided. default undefined
 * @param {boolean | undefined | null} strict whether to use the stricter set of rule configurations. default false
 * @returns a preconfigured flat ESLint configuration
 */
export function getFlatConfig(options?: {
  strict?: boolean;
  appPrefix?: string;
  tsconfigDir?: string;
}): TSESLint.FlatConfig.ConfigArray;

/**
 * A default configuration for Angular apps and libraries
 */
export const angularRecommended: () => TSESLint.FlatConfig.ConfigArray;

/**
 * Adefault configuration for plain typescript apps and libraries
 */
export const tsRecommended: () => TSESLint.FlatConfig.ConfigArray;

export default getFlatConfig;
