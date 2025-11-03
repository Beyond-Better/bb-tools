/**
 * Data source types and interfaces for the BB Tools Framework.
 * Provides minimal type definitions for data source connections as seen by tools.
 *
 * Note: These are simplified versions of the full BB implementation types.
 * They expose only what tools need to work with data sources.
 *
 * @module
 */

/**
 * Data source provider types supported by BB.
 * Identifies the underlying provider technology.
 *
 * @example
 * ```ts
 * const type: DataSourceProviderType = 'filesystem';
 * ```
 */
export type DataSourceProviderType =
  | 'filesystem'
  | 'google'
  | 'notion'
  | 'supabase'
  | 'mcp'
  | 'unknown';

/**
 * Data source access methods.
 * Indicates how BB interacts with the data source.
 *
 * @example
 * ```ts
 * const method: DataSourceAccessMethod = 'bb';
 * ```
 */
export type DataSourceAccessMethod = 'bb' | 'mcp';

/**
 * Capabilities that a data source may support.
 * Tools can check these to determine what operations are available.
 *
 * @example
 * ```ts
 * const capabilities: DataSourceCapability[] = ['read', 'write', 'list'];
 * ```
 */
export type DataSourceCapability =
  | 'read'
  | 'write'
  | 'list'
  | 'search'
  | 'move'
  | 'delete';

/**
 * Data source configuration.
 * Provider-specific settings (simplified for tool access).
 *
 * @example
 * ```ts
 * const config: DataSourceConfig = {
 *   dataSourceRoot: '/path/to/project'
 * };
 * ```
 */
export interface DataSourceConfig {
  dataSourceRoot?: string; // For filesystem type
  [key: string]: unknown; // Provider-specific settings
}

/**
 * Data source connection interface.
 * Represents a configured data source instance as seen by tools.
 *
 * This is a minimal interface exposing only what tools need.
 * The full implementation in BB has additional methods and properties.
 *
 * @example
 * ```ts
 * function checkDataSource(ds: DataSourceConnection) {
 *   console.log(`${ds.name} (${ds.providerType})`);
 *   console.log(`Can write: ${ds.capabilities.includes('write')}`);
 *   console.log(`Read-only: ${ds.readonly}`);
 * }
 * ```
 */
export interface DataSourceConnection {
  /**
   * Unique identifier for this connection.
   *
   * @example
   * ```ts
   * const id = dsConnection.id; // 'ds-abc123'
   * ```
   */
  readonly id: string;

  /**
   * Human-readable name for this connection.
   *
   * @example
   * ```ts
   * const name = dsConnection.name; // 'project-files'
   * ```
   */
  name: string;

  /**
   * Provider type (filesystem, google, notion, etc.).
   *
   * @example
   * ```ts
   * if (dsConnection.providerType === 'filesystem') {
   *   // Handle filesystem-specific logic
   * }
   * ```
   */
  readonly providerType: DataSourceProviderType;

  /**
   * Access method (bb or mcp).
   *
   * @example
   * ```ts
   * const method = dsConnection.accessMethod; // 'bb'
   * ```
   */
  readonly accessMethod: DataSourceAccessMethod;

  /**
   * Capabilities this data source supports.
   *
   * @example
   * ```ts
   * const canWrite = dsConnection.capabilities.includes('write');
   * const canSearch = dsConnection.capabilities.includes('search');
   * ```
   */
  readonly capabilities: DataSourceCapability[];

  /**
   * Provider-specific configuration.
   *
   * @example
   * ```ts
   * if (dsConnection.providerType === 'filesystem') {
   *   const root = dsConnection.config.dataSourceRoot;
   * }
   * ```
   */
  config: DataSourceConfig;

  /**
   * Whether this connection is currently enabled.
   *
   * @example
   * ```ts
   * if (!dsConnection.enabled) {
   *   console.warn('Data source is disabled');
   * }
   * ```
   */
  enabled: boolean;

  /**
   * Whether this connection is read-only.
   *
   * @example
   * ```ts
   * if (dsConnection.readonly) {
   *   console.log('Cannot modify resources in this data source');
   * }
   * ```
   */
  readonly: boolean;

  /**
   * Whether this is the primary data source.
   *
   * @example
   * ```ts
   * if (dsConnection.isPrimary) {
   *   console.log('This is the default data source');
   * }
   * ```
   */
  isPrimary: boolean;

  /**
   * URI prefix for resources in this data source.
   *
   * @example
   * ```ts
   * const prefix = dsConnection.uriPrefix; // 'bb+filesystem+project+file:'
   * ```
   */
  uriPrefix?: string;

  /**
   * URI template for constructing resource URIs.
   *
   * @example
   * ```ts
   * const template = dsConnection.uriTemplate; // 'bb+filesystem+project+file:./{path}'
   * ```
   */
  uriTemplate?: string;
}
