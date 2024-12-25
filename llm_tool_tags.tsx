/** @jsxRuntime automatic */
/** @jsxImportSource npm:preact@10.25.3 */
import type { JSX } from "preact/jsx-runtime";
import { colors } from "cliffy/ansi/colors";

// Helper functions for formatting
const formatNumber = (
  num: number,
  opts: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
): string => {
  return new Intl.NumberFormat("en-US", opts).format(num);
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  return "just now";
};

// Helper function for converting boolean values to strings
const formatBoolean = (
  value: boolean,
  format: "yes/no" | "enabled/disabled" | "included/excluded" | string =
    "yes/no",
): string => {
  return format === "yes/no"
    ? (value ? "Yes" : "No")
    : format === "enabled/disabled"
    ? (value ? "Enabled" : "Disabled")
    : format === "included/excluded"
    ? (value ? "Included" : "Excluded")
    : (value ? format.split("/")[0] : format.split("/")[1]).toUpperCase();
};

export const TOOL_STYLES_BROWSER = {
  base: {
    container: "rounded-lg prose dark:prose-invert max-w-none py-1 px-4",
    box: "rounded-lg max-w-none py-1 px-4 whitespace-pre-wrap",
    pre:
      "p-2.5 rounded font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/50",
    code:
      "font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/50",
    list: "space-y-2",
    listItem: "ml-4",
    label: "font-semibold text-gray-700 dark:text-gray-300",
  },
  status: {
    error:
      "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    success:
      "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400",
    info:
      "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
  },
  content: {
    error:
      "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-800 px-2 py-1 rounded",
    code: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    data: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700",
    filename: "font-mono text-cyan-600 dark:text-cyan-400",
    timestamp: "font-mono text-gray-600 dark:text-gray-400",
    duration: "font-mono text-purple-600 dark:text-purple-400",
    timeRange: "font-mono text-purple-600 dark:text-purple-400",
    timeAgo: "font-mono text-purple-600 dark:text-purple-400",
    percentage: "font-mono text-emerald-600 dark:text-emerald-400",
    number: "font-mono text-blue-600 dark:text-blue-400",
    bytes: "font-mono text-blue-600 dark:text-blue-400",
    speed: "font-mono text-blue-600 dark:text-blue-400",
    status: {
      running:
        "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-sm",
      completed:
        "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-sm",
      failed:
        "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full text-sm",
      pending:
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full text-sm",
      success:
        "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-sm",
      error:
        "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full text-sm",
      warning:
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full text-sm",
    },
    progress: "font-mono text-blue-600 dark:text-blue-400",
    priority: {
      high: "text-red-600 dark:text-red-400 font-semibold",
      medium: "text-yellow-600 dark:text-yellow-400 font-semibold",
      low: "text-green-600 dark:text-green-400 font-semibold",
    },
    version: "font-mono text-gray-600 dark:text-gray-400",
    badge: {
      default:
        "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-sm",
      primary:
        "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-sm",
      success:
        "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-sm",
      warning:
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full text-sm",
      error:
        "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full text-sm",
    },
    icon: "inline-block align-middle",
    link:
      "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline",
    diff: {
      add:
        "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 font-mono",
      remove:
        "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 font-mono",
    },
    truncated: "truncate",
    url: "font-mono text-blue-600 dark:text-blue-400 break-all",
    counts: "font-mono text-purple-600 dark:text-purple-400",
    tokenUsage: "font-mono text-purple-600 dark:text-purple-400",
    toolName: "font-mono text-blue-600 dark:text-blue-400",
    date: "font-mono text-gray-600 dark:text-gray-400",
    directory: "font-mono text-cyan-700 dark:text-cyan-400",
    boolean: "font-mono text-indigo-600 dark:text-indigo-400",
    regex:
      "font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-1 rounded",
    size: "font-mono text-gray-600 dark:text-gray-400",
  },
};

// Console styling functions using Cliffy colors
export const TOOL_STYLES_CONSOLE = {
  base: {
    label: (text: string): string => colors.bold(text),
    value: (text: string): string => text,
    code: (text: string): string => text,
    list: (text: string): string => text,
    listItem: (text: string): string => `  ${text}`, // 2-space indent
  },
  status: {
    error: (text: string): string => colors.red(text),
    success: (text: string): string => colors.green(text),
    warning: (text: string): string => colors.yellow(text),
    info: (text: string): string => colors.blue(text),
  },
  content: {
    timestamp: (date: Date | string): string =>
      colors.gray(new Date(date).toISOString()),
    duration: (ms: number): string => colors.magenta(formatDuration(ms)),
    timeRange: (start: Date | string, end: Date | string): string =>
      colors.magenta(
        `${new Date(start).toLocaleTimeString()} - ${
          new Date(end).toLocaleTimeString()
        }`,
      ),
    timeAgo: (date: Date | string): string =>
      colors.gray(formatTimeAgo(new Date(date))),
    date: (value: Date | string): string =>
      colors.gray(new Date(value).toLocaleString()),
    percentage: (value: number, decimals = 1): string =>
      colors.green(
        `${
          formatNumber(value, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        }%`,
      ),
    number: (
      value: number,
      opts: { minimumFractionDigits?: number; maximumFractionDigits?: number } =
        {},
    ): string => colors.blue(formatNumber(value, opts)),
    bytes: (value: number, decimals = 1): string => {
      const units = ["B", "KB", "MB", "GB"];
      let size = value;
      let unit = 0;
      while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
      }
      return colors.blue(
        `${
          formatNumber(size, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        } ${units[unit]}`,
      );
    },
    speed: (value: number, unit: string, decimals = 1): string =>
      colors.blue(
        `${
          formatNumber(value, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        } ${unit}/s`,
      ),
    status: {
      running: (text: string): string => colors.blue(text),
      completed: (text: string): string => colors.green(text),
      failed: (text: string): string => colors.red(text),
      pending: (text: string): string => colors.yellow(text),
      success: (text: string): string => colors.green(text),
      error: (text: string): string => colors.red(text),
      warning: (text: string): string => colors.yellow(text),
    },
    progress: (current: number, total: number): string =>
      colors.blue(`${formatNumber(current)}/${formatNumber(total)}`),
    priority: {
      high: (text: string): string => colors.red(colors.bold(text)),
      medium: (text: string): string => colors.yellow(colors.bold(text)),
      low: (text: string): string => colors.green(colors.bold(text)),
    },
    version: (version: string): string => colors.gray(version),
    badge: {
      default: (text: string): string => colors.gray(text),
      primary: (text: string): string => colors.blue(text),
      success: (text: string): string => colors.green(text),
      warning: (text: string): string => colors.yellow(text),
      error: (text: string): string => colors.red(text),
    },
    icon: (text: string): string => text,
    link: (text: string): string => colors.blue(colors.underline(text)),
    diff: {
      add: (text: string): string => colors.green(text),
      remove: (text: string): string => colors.red(text),
    },
    truncated: (text: string, maxLength: number): string =>
      text.length > maxLength ? `${text.slice(0, maxLength)}...` : text,
    title: (text: string, toolName: string): string =>
      `${colors.bold(text)} ${colors.blue(`(${toolName})`)}`,
    subtitle: (text: string): string => colors.dim(text),
    filename: (path: string): string => colors.cyan(path),
    url: (url: string): string => colors.blue(url),
    counts: (value: number): string => colors.magenta(formatNumber(value)),
    tokenUsage: (value: number): string => colors.magenta(formatNumber(value)),
    toolName: (name: string): string => colors.blue(name),
    directory: (path: string): string => colors.cyan(path),
    boolean: (
      value: boolean,
      format: "yes/no" | "enabled/disabled" | "included/excluded" | string =
        "yes/no",
    ): string => colors.magenta(formatBoolean(value, format)),
    regex: (pattern: string): string => colors.yellow(pattern),
    size: (bytes: number): string => {
      const units = ["B", "KB", "MB", "GB"];
      let size = bytes;
      let unit = 0;
      while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
      }
      return colors.gray(
        `${
          formatNumber(size, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })
        } ${units[unit]}`,
      );
    },
    patch: (text: string): string => colors.yellow(text),
    code: (text: string): string => text,
    data: (text: string): string => colors.blue(text),
  },
};

// Header tag functions
export const createToolTitle = (
  toolRole: string,
  toolName: string,
): JSX.Element => {
  const title = toolRole === "Tool Use"
    ? "Tool Input"
    : toolRole === "Tool Result"
    ? "Tool Output"
    : "Tool";
  return (
    <div className="bb-log-entry-title">
      {title} <span className="bb-log-entry-toolname">({toolName})</span>
    </div>
  );
};

export const createToolSubtitle = (text: string | JSX.Element): JSX.Element => (
  <span className="bb-log-entry-subtitle">{text}</span>
);

// Content tag functions
export const createToolContent = (
  content: string | JSX.Element,
  style: string = TOOL_STYLES_BROWSER.base.container,
): JSX.Element => <div className={style}>{content}</div>;

export const createToolBox = (
  content: string | JSX.Element,
  style: string = TOOL_STYLES_BROWSER.base.box,
): JSX.Element => <div className={style}>{content}</div>;

export const createToolPre = (
  content: string,
  style: string = TOOL_STYLES_BROWSER.base.pre,
): JSX.Element => <pre className={style}>{content}</pre>;

export const createToolCode = (
  content: string,
  style: string = TOOL_STYLES_BROWSER.base.code,
): JSX.Element => <code className={style}>{content}</code>;

export const createToolList = (
  items: (string | JSX.Element)[],
  style: string = TOOL_STYLES_BROWSER.base.list,
): JSX.Element => (
  <ul className={style}>
    {items.map((item, index): JSX.Element => (
      <li key={index} className={TOOL_STYLES_BROWSER.base.listItem}>
        {item}
      </li>
    ))}
  </ul>
);

// Create new tag functions for content elements
export const createToolLabel = (text: string): JSX.Element => (
  <strong className={TOOL_STYLES_BROWSER.base.label}>{text}</strong>
);

export const createToolFilename = (text: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.filename}>{text}</span>
);

export const createToolUrl = (text: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.url}>{text}</span>
);

export const createToolCounts = (count: number): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.counts}>
    {count.toLocaleString()}
  </span>
);

export const createToolTokenUsage = (count: number): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.tokenUsage}>
    {count.toLocaleString()}
  </span>
);

export const createToolToolName = (text: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.toolName}>{text}</span>
);

export const createToolDate = (text: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.date}>{text}</span>
);

export const createToolImage = (src: string, alt: string): JSX.Element => (
  <img src={src} alt={alt} className="max-w-full h-auto rounded" />
);

export const createToolDirectory = (text: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.directory}>{text}</span>
);

export const createToolBoolean = (
  value: boolean,
  format: "yes/no" | "enabled/disabled" | "included/excluded" | string =
    "yes/no",
): JSX.Element => {
  const text = formatBoolean(value, format);
  return <span className={TOOL_STYLES_BROWSER.content.boolean}>{text}</span>;
};

export const createToolRegex = (text: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.regex}>{text}</span>
);

export const createToolSize = (bytes: number): JSX.Element => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return (
    <span className={TOOL_STYLES_BROWSER.content.size}>
      {size.toFixed(1)} {units[unit]}
    </span>
  );
};

// Create new tag functions for time-related elements
export const createToolTimestamp = (date: Date): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.timestamp}>
    {date.toISOString()}
  </span>
);

export const createToolDuration = (milliseconds: number): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.duration}>
    {formatDuration(milliseconds)}
  </span>
);

export const createToolTimeAgo = (date: Date): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.timeAgo}>
    {formatTimeAgo(date)}
  </span>
);

export const createToolTimeRange = (start: Date, end: Date): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.timeRange}>
    {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
  </span>
);

// Create new tag functions for numbers/metrics
export const createToolPercentage = (
  value: number,
  decimals = 1,
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.percentage}>
    {formatNumber(value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}%
  </span>
);

export const createToolNumber = (value: number): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.number}>
    {formatNumber(value)}
  </span>
);

export const createToolBytes = (bytes: number, decimals = 1): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.bytes}>
    {formatNumber(bytes, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} B
  </span>
);

export const createToolSpeed = (
  value: number,
  unit: string,
  decimals = 1,
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.speed}>
    {formatNumber(value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} {unit}/s
  </span>
);

// Create new tag functions for status/states
export const createToolStatus = (
  status: "running" | "completed" | "failed" | "pending",
  text?: string,
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.status[status]}>
    {text ?? status}
  </span>
);

export const createToolProgress = (
  current: number,
  total: number,
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.progress}>
    {current}/{total}
  </span>
);

export const createToolPriority = (
  level: "high" | "medium" | "low",
  text?: string,
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.priority[level]}>
    {text ?? level}
  </span>
);

export const createToolVersion = (version: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.version}>
    {version}
  </span>
);

// Create error tag function
export const createToolError = (text: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.error}>{text}</span>
);

// Create new tag functions for UI/display
export const createToolBadge = (
  text: string,
  type: "default" | "primary" | "success" | "warning" | "error" = "default",
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.badge[type]}>
    {text}
  </span>
);

export const createToolIcon = (icon: string): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.icon}>
    {icon}
  </span>
);

export const createToolLink = (text: string, href: string): JSX.Element => (
  <a
    href={href}
    className={TOOL_STYLES_BROWSER.content.link}
    target="_blank"
    rel="noopener noreferrer"
  >
    {text}
  </a>
);

export const createToolDiff = (
  text: string,
  type: "add" | "remove",
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.diff[type]}>
    {type === "add" ? "+" : "-"}
    {text}
  </span>
);

export const createToolTruncated = (
  text: string,
  maxLength: number,
): JSX.Element => (
  <span className={TOOL_STYLES_BROWSER.content.truncated}>
    {text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
  </span>
);

// Export a single object for tag functions
export const TOOL_TAGS = {
  base: {
    container: createToolContent,
    box: createToolBox,
    pre: createToolPre,
    code: createToolCode,
    list: createToolList,
    label: createToolLabel,
  },
  content: {
    title: createToolTitle,
    subtitle: createToolSubtitle,
    filename: createToolFilename,
    directory: createToolDirectory,
    url: createToolUrl,
    image: createToolImage,
    link: createToolLink,
    counts: createToolCounts,
    tokenUsage: createToolTokenUsage,
    size: createToolSize,
    percentage: createToolPercentage,
    number: createToolNumber,
    bytes: createToolBytes,
    speed: createToolSpeed,
    timestamp: createToolTimestamp,
    duration: createToolDuration,
    timeRange: createToolTimeRange,
    timeAgo: createToolTimeAgo,
    date: createToolDate,
    status: createToolStatus,
    progress: createToolProgress,
    priority: createToolPriority,
    version: createToolVersion,
    boolean: createToolBoolean,
    badge: createToolBadge,
    icon: createToolIcon,
    diff: createToolDiff,
    truncated: createToolTruncated,
    regex: createToolRegex,
    error: createToolError,
    toolName: createToolToolName,
  },
};
