# Keeping bb-tools in sync with bb-saas

bb-tools is the package plugin tools are written against. Its files are hand-written copies (shims)
of classes and types in bb-saas, the BB API. BB loads a plugin tool by duck typing: it imports the
built `tool.js`, calls `new module.default(name, description, toolConfig, metadata)` and then calls
methods on the result. Nothing checks that the tool's class matches the API's `LLMTool`, so when the
API starts calling a member this package doesn't provide, plugin tools built on it fail at runtime,
not at build time.

**When the API changes one of the files below, update the matching shim here and publish a new
version.** bb-saas reminds you with a `KEEP IN SYNC` comment at the top of each source file in the
table.

| bb-tools file       | Mirrors (bb-saas)                                                                                                         | Kind               | Drift breaks                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------- |
| `llm_tool.ts`       | `api/src/llms/llmTool.ts`; `LLMToolMetadata` and its types in `api/src/llms/llmToolManager.ts`                            | base class + types | **Runtime**: a member the API calls but the class lacks throws for every plugin |
| `interaction.ts`    | `api/src/llms/interactions/conversationInteraction.ts` (and `baseInteraction.ts`), as seen by tools                       | interface          | Compile only: a plugin calling a member the API dropped fails when it runs it   |
| `project_editor.ts` | `api/src/editor/projectEditor.ts`, as seen by tools                                                                       | interface          | Same as above                                                                   |
| `data_source.ts`    | `api/src/dataSources/dataSourceConnection.ts` and the provider/capability types in `shared/src/types/dataSource.types.ts` | interface + types  | Same as above                                                                   |
| `message.ts`        | `api/src/llms/llmMessage.ts` (content parts, `LLMAnswerToolUse`)                                                          | types              | Type errors in plugins; wrong shapes in tool results                            |
| `types.ts`          | `shared/src/types.ts` (token usage, file metadata, tool stats)                                                            | types              | Type errors in plugins                                                          |
| `llm_tool_tags.tsx` | `api/src/llms/llmToolTags.tsx` (`TOOL_TAGS_BROWSER`, `TOOL_STYLES_*`)                                                     | formatting helpers | Nothing at runtime (each plugin bundles its own copy); looks differ from BB's   |

## Checklist for a change to the API's LLMTool

1. Compare `llm_tool.ts` with bb-saas `api/src/llms/llmTool.ts`: every public member the API calls
   on a tool must exist here with the same name and a compatible signature, and every abstract
   member a tool must implement must be abstract here too. Find what the API calls with, in bb-saas:
   `grep -rn "tool\.\w*(" api/src/llms/llmToolManager.ts api/src/llms/interactions api/src/utils/toolFeedbackHelper.utils.ts`.
   A member the API calls unguarded (no `?.`) is the one that breaks plugins.
2. Compare `LLMToolMetadata` with bb-saas `api/src/llms/llmToolManager.ts`; copy new fields and the
   types they use.
3. Export new public types from `mod.ts`.
4. Check: `deno check mod.ts examples/mod.ts examples/*/*/tool.ts`.
5. Smoke test from bb-saas: build a plugin whose tool extends this package's `LLMTool`
   (`deno task build:plugin <plugin-dir>`), import the built `tool.js`, construct it as above and
   call the members the API calls. bb-saas `docs/development/guides/building-plugins.md` describes
   the build.
6. Bump the version and publish; then raise the `@beyondbetter/tools` version in bb-saas
   `import_map.json` if BB's own docs or examples need the new release.

## Known drift (2026-11-22)

`llm_tool.ts` was brought up to date with the API on 2026-11-22 (bb-saas-caiu): `residencyPolicy`,
`prepareToolsWithContext`, `handleOversizedResult`, `formatStatusSummary` and `approvalTitle` were
missing, and the API calls `formatStatusSummary` and `handleOversizedResult` unguarded, so plugin
tools built on 0.1.4 fail in current BB. The metadata gained `title`, `aliasNames`, `runsIn`,
`residencyPolicy`, `retired`, `configSchema`, `requiredConfig` and `systemPromptAdditions`, and
`finalizeCallback` now returns a promise.

The other shims are still behind:

- `project_editor.ts`: `projectRoot`, `changedFiles`, `changeContents`, `logAndCommitChanges`,
  `prepareFilesForConversation`, `resolveProjectFilePath` and `isPathWithinProject` no longer exist
  on the API's `ProjectEditor` (the file-based model became data sources;
  `prepareFilesForConversation` is now `prepareResourcesForCollaboration`). Members tools use today
  and the shim lacks include `workspaceId`, `getDsConnectionForPrefix`,
  `getFirstFilesystemDsConnection` and `changedResources`.
- `interaction.ts`: `getFileMetadata` and `tokenUsageConversation` no longer exist on the API's
  interaction classes; the remaining members exist, but their signatures have not been checked.
- `data_source.ts`: its fields still exist on the API's `DataSourceConnection`, but it has none of
  the methods tools use to read and write resources (`getResourceAccessor()`, `hasCapability()`,
  `getUriForResource()`), so a plugin tool can't reach data source content through these types.
- `llm_tool_tags.tsx`: differs from the API's `llmToolTags.tsx` in about 100 lines.

Bringing those up to date means deciding what the plugin-facing API should be (built-in tools reach
far into API internals, such as `projectEditor.userContext`), so it is tracked separately in bb-saas
beads.
