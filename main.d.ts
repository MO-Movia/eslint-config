/**
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 * @file Setup scripts for ESLint.
 */
// @ts-check
import type { TSESLint } from '@typescript-eslint/utils';

/**
 * All tsconfig files in project are considered when linting.
 *
 * @param { {strict?: boolean, appPrefix?: string } | undefined } options config for base ruleset.
 * - appPrefix { string | undefined | null } Angular App/Lib prefix. default none (non-angular project)
 * - strict { boolean | undefined | null } Whether to use the stricter set of rule configurations. default false
 * @returns a preconfigured flat ESLint configuration
 */
export function getFlatConfig(options?: {
  strict?: boolean;
  appPrefix?: string;
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
