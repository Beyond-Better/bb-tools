import type { LLMToolInputSchema } from '../../mod.ts';
import type { OpenInBrowserInput } from './tool.ts';

export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): string {
  const input = toolInput as OpenInBrowserInput;
  const { urls, browser = 'default' } = input;

  const urlList = urls.map(url => `  - ${url}`).join('\n');
  const browserInfo = browser !== 'default' ? `\nUsing browser: ${browser}` : '';

  return `Opening URLs in browser:
${urlList}${browserInfo}`;
}

export function formatLogEntryToolResult(
  resultContent: unknown,
): string {
  const content = resultContent as string;
  const lines = content.split('\n');
  const hasErrors = content.includes('Errors encountered:');

  if (hasErrors) {
    // Add some visual separation for errors
    return lines.map(line => 
      line.startsWith('Error') ? `  ! ${line}` : line
    ).join('\n');
  }

  return content;
}