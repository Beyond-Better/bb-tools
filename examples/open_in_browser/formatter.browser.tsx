import { JSX } from 'preact';
import type { LLMToolInputSchema } from '../../mod.ts';
import type { OpenInBrowserInput } from './tool.ts';

export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): JSX.Element {
  const input = toolInput as OpenInBrowserInput;
  const { urls, browser = 'default' } = input;

  return (
    <div class="tool-use">
      <div class="tool-header">Opening URLs in browser:</div>
      <div class="tool-content">
        <ul>
          {urls.map((url, index) => (
            <li key={index}>
              <code>{url}</code>
            </li>
          ))}
        </ul>
        {browser !== 'default' && (
          <div class="browser-choice">
            Using browser: <code>{browser}</code>
          </div>
        )}
      </div>
    </div>
  );
}

export function formatLogEntryToolResult(
  resultContent: unknown,
): JSX.Element {
  const content = resultContent as string;
  const lines = content.split('\n');
  const hasErrors = content.includes('Errors encountered:');

  return (
    <div class="tool-result">
      {hasErrors ? (
        <div class="result-content">
          {lines.map((line, index) => (
            <div key={index} class={line.startsWith('Error') ? 'error-line' : ''}>
              {line}
            </div>
          ))}
        </div>
      ) : (
        <div class="success-content">
          {lines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}