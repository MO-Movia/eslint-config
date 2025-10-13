/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 * @file Setup scripts for ESLint.
 */
// @ts-check
import type { TSESLint } from '@typescript-eslint/utils';

/** Default license header options. */
export const header: {
  /** Default license for Modus open source code. */
  mit: { license: string; copyright: string };
  /** Default license for multi-copyright code. Auto fix will stub with TODO comment */
  manual: { license: string; copyright: string };
};

/**
 * All tsconfig files in project are considered when linting.
 *
 * @param { {strict?: boolean, appPrefix?: string, header: { license?: string, copyright: string } | false } } options config for base ruleset.
 * - appPrefix `string | undefined | null` Angular App/Lib prefix. default none (non-angular project)
 * - strict `boolean | undefined | null` Whether to use the stricter set of rule configurations. default false
 * - header `{ license?: string, copyright: string }` License and copyright information. Or explicitly set to false to disable (not recommended).
 * @throws Error if appPrefix is set but angular-eslit is not innstalled
 * @throws Error if header is not defined
 * @returns a preconfigured flat ESLint configuration
 */
export function getFlatConfig(options: {
  strict?: boolean;
  appPrefix?: string;
  header: { license?: string; copyright: string };
}): TSESLint.FlatConfig.ConfigArray;

export default getFlatConfig;
