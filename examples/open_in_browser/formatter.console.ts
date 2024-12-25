import { stripIndents } from 'common-tags';
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
    title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'Open in Browser'),
    subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Opening URLs in browser...'),
    content: stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('URLs to Open')}
      ${urls.map(url => 
        LLMTool.TOOL_STYLES_CONSOLE.base.listItem(
          LLMTool.TOOL_STYLES_CONSOLE.content.url(url)
        )
      ).join('\n')}
      ${browser !== 'default' ? stripIndents`
        ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Using Browser:')} 
        ${LLMTool.TOOL_STYLES_CONSOLE.content.text(browser)}` : ''}`,
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
      results.push(LLMTool.TOOL_STYLES_CONSOLE.content.success(line));
    } else if (line.startsWith('Error')) {
      errors.push(LLMTool.TOOL_STYLES_CONSOLE.content.error(line));
    }
  }

  return {
    title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Result', 'Open in Browser'),
    subtitle: hasErrors 
      ? LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Some errors occurred')
      : LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('URLs opened successfully'),
    content: stripIndents`
      ${results.length > 0 ? stripIndents`
        ${LLMTool.TOOL_STYLES_CONSOLE.content.status('completed', 'Success')}
        ${results.map(result => 
          LLMTool.TOOL_STYLES_CONSOLE.base.listItem(result)
        ).join('\n')}` : ''}
      ${errors.length > 0 ? stripIndents`
        ${LLMTool.TOOL_STYLES_CONSOLE.content.status('error', 'Errors')}
        ${errors.map(error => 
          LLMTool.TOOL_STYLES_CONSOLE.base.listItem(error)
        ).join('\n')}` : ''}`,
    preview: hasErrors 
      ? `Encountered ${errors.length} error(s) while opening URLs`
      : `Successfully opened ${results.length} URL(s)`,
  };
}