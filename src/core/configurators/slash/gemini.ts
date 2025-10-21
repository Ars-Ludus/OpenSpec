import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.gemini/commands/openspec-proposal.md',
  apply: '.gemini/commands/openspec-apply.md',
  archive: '.gemini/commands/openspec-archive.md'
};

export class GeminiSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'gemini';
  readonly isAvailable = true;

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string | undefined {
    return undefined;
  }
}

