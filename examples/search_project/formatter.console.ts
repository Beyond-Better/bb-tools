import type { LLMToolInputSchema, LLMToolLogEntryFormattedResult } from '../../mod.ts';
import type { SearchProjectInput } from './tool.ts';
import LLMTool from '../../mod.ts';

const { TOOL_STYLES_CONSOLE: styles } = LLMTool;

export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  const input = toolInput as SearchProjectInput;
  const {
    contentPattern,
    caseSensitive,
    filePattern,
    dateAfter,
    dateBefore,
    sizeMin,
    sizeMax,
  } = input;

  const criteria = [];
  if (contentPattern) {
    criteria.push(
      `Content Pattern: ${styles.content.regex(contentPattern)}` +
      (caseSensitive !== undefined
        ? ` (case ${styles.content.boolean(caseSensitive, 'sensitive/insensitive')})`
        : '')
    );
  }
  if (filePattern) {
    criteria.push(
      `File Pattern: ${styles.content.filename(filePattern)}`
    );
  }
  if (dateAfter) {
    criteria.push(
      `Modified After: ${styles.content.date(dateAfter)}`
    );
  }
  if (dateBefore) {
    criteria.push(
      `Modified Before: ${styles.content.date(dateBefore)}`
    );
  }
  if (sizeMin !== undefined) {
    criteria.push(
      `Minimum Size: ${styles.content.size(sizeMin)}`
    );
  }
  if (sizeMax !== undefined) {
    criteria.push(
      `Maximum Size: ${styles.content.size(sizeMax)}`
    );
  }

  const content = [
    'Searching project with criteria:',
    ...criteria.map(c => styles.base.listItem(c))
  ].join('\n');

  const preview = contentPattern
    ? `Searching for ${contentPattern}`
    : 'Searching project files';

  return {
    title: styles.content.title('Tool Input', 'search_project'),
    content,
    preview,
  };
}

export function formatLogEntryToolResult(
  resultContent: unknown,
): LLMToolLogEntryFormattedResult {
  const content = resultContent as string;
  const lines = content.split('\n');
  const fileCount = lines[1].split(' ')[0];
  const criteria = lines[1].split(': ')[1];

  const formattedContent = lines
    .filter(line => !line.startsWith('<files>') && !line.startsWith('</files>'))
    .map(line => {
      if (line.startsWith('Error:')) {
        return styles.status.error(line);
      }
      return line;
    })
    .join('\n');

  return {
    title: styles.content.title('Tool Output', 'search_project'),
    subtitle: styles.content.subtitle(`Found ${fileCount} files`),
    content: formattedContent,
    preview: `Found ${fileCount} files matching ${criteria}`,
  };
}