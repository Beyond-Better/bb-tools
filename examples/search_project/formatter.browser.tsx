/** @jsxImportSource preact */
import type { LLMToolInputSchema, LLMToolLogEntryFormattedResult } from '../../mod.ts';
import type { SearchProjectInput } from './mod.ts';
import LLMTool from '../../mod.ts';

const { TOOL_TAGS: tags } = LLMTool;

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
      <div>
        Content Pattern: {tags.content.regex(contentPattern)}
        {caseSensitive !== undefined && (
          <span> (case {caseSensitive ? 'sensitive' : 'insensitive'})</span>
        )}
      </div>
    );
  }
  if (filePattern) {
    criteria.push(
      <div>File Pattern: {tags.content.filename(filePattern)}</div>
    );
  }
  if (dateAfter) {
    criteria.push(
      <div>Modified After: {tags.content.date(dateAfter)}</div>
    );
  }
  if (dateBefore) {
    criteria.push(
      <div>Modified Before: {tags.content.date(dateBefore)}</div>
    );
  }
  if (sizeMin !== undefined) {
    criteria.push(
      <div>Minimum Size: {tags.content.size(sizeMin)}</div>
    );
  }
  if (sizeMax !== undefined) {
    criteria.push(
      <div>Maximum Size: {tags.content.size(sizeMax)}</div>
    );
  }

  const content = (
    <div>
      <div>Searching project with criteria:</div>
      {criteria}
    </div>
  );

  const preview = contentPattern
    ? `Searching for ${contentPattern}`
    : 'Searching project files';

  return {
    title: tags.content.title('Tool Input', 'search_project'),
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

  const formattedContent = (
    <div>
      {lines.map((line, index) => {
        if (line.startsWith('<files>') || line.startsWith('</files>')) {
          return null;
        }
        if (line.startsWith('Error:')) {
          return (
            <div key={index}>
              {tags.content.error(line)}
            </div>
          );
        }
        return <div key={index}>{line}</div>;
      })}
    </div>
  );

  return {
    title: tags.content.title('Tool Output', 'search_project'),
    subtitle: tags.content.subtitle(`Found ${fileCount} files`),
    content: formattedContent,
    preview: `Found ${fileCount} files matching ${criteria}`,
  };
}