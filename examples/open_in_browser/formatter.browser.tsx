/** @jsxImportSource preact */
import LLMTool, {
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult
} from '@beyondbetter/tools';
import type { OpenInBrowserInput } from './tool.ts';

export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  const input = toolInput as OpenInBrowserInput;
  const { urls, browser = 'default' } = input;

  return {
    title: LLMTool.TOOL_TAGS_BROWSER.content.title('Tool Use', 'Open in Browser'),
    subtitle: LLMTool.TOOL_TAGS_BROWSER.content.subtitle('Opening URLs in browser...'),
    content: LLMTool.TOOL_TAGS_BROWSER.base.container(
      <>
        {LLMTool.TOOL_TAGS_BROWSER.base.label('URLs to Open')}
        {LLMTool.TOOL_TAGS_BROWSER.base.list(
          urls.map(url => LLMTool.TOOL_TAGS_BROWSER.content.url(url))
        )}
        {browser !== 'default' && (
          <>
            {LLMTool.TOOL_TAGS_BROWSER.base.label('Using Browser:')}
            {' '}
            {LLMTool.TOOL_TAGS_BROWSER.content.text(browser)}
          </>
        )}
      </>
    ),
    preview: `Opening ${urls.length} URL(s)${browser !== 'default' ? ` in ${browser}` : ''}`,
  };
}

export function formatLogEntryToolResult(
  resultContent: unknown,
): LLMToolLogEntryFormattedResult {
  const content = resultContent as string;
  const lines = content.split('\n');
  const hasErrors = content.includes('Errors encountered:');

  const results = [];
  const errors = [];

  for (const line of lines) {
    if (line.startsWith('Successfully')) {
      results.push(LLMTool.TOOL_TAGS_BROWSER.content.success(line));
    } else if (line.startsWith('Error')) {
      errors.push(LLMTool.TOOL_TAGS_BROWSER.content.error(line));
    }
  }

  return {
    title: LLMTool.TOOL_TAGS_BROWSER.content.title('Tool Result', 'Open in Browser'),
    subtitle: hasErrors 
      ? LLMTool.TOOL_TAGS_BROWSER.content.subtitle('Some errors occurred')
      : LLMTool.TOOL_TAGS_BROWSER.content.subtitle('URLs opened successfully'),
    content: LLMTool.TOOL_TAGS_BROWSER.base.container(
      <>
        {results.length > 0 && (
          <>
            {LLMTool.TOOL_TAGS_BROWSER.content.status('completed', 'Success')}
            {LLMTool.TOOL_TAGS_BROWSER.base.list(results)}
          </>
        )}
        {errors.length > 0 && (
          <>
            {LLMTool.TOOL_TAGS_BROWSER.content.status('error', 'Errors')}
            {LLMTool.TOOL_TAGS_BROWSER.base.list(errors)}
          </>
        )}
      </>
    ),
    preview: hasErrors 
      ? `Encountered ${errors.length} error(s) while opening URLs`
      : `Successfully opened ${results.length} URL(s)`,
  };
}