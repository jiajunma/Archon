/**
 * ToolResultDetail — renders tool_result with error/warning highlighting
 *
 * Highlights Lean compilation errors (lines containing "error:" or "warning:")
 * and tool_use_error tags.
 */
import styles from './details.module.css';

interface Props {
  content: string;
}

function classifyLine(line: string): 'error' | 'warning' | 'success' | 'normal' {
  const lower = line.toLowerCase();
  if (
    lower.includes('error:') ||
    lower.includes('tool_use_error') ||
    lower.includes('eacces') ||
    lower.includes('type mismatch') ||
    lower.includes('unknown identifier') ||
    lower.includes('unknown constant') ||
    lower.includes('unsolved goals')
  )
    return 'error';
  if (
    lower.includes('warning:') ||
    lower.includes("uses 'sorry'") ||
    /tactic '[^']+' failed/.test(lower)
  )
    return 'warning';
  if (lower.includes('successfully') || lower.includes('no errors'))
    return 'success';
  return 'normal';
}

export default function ToolResultDetail({ content }: Props) {
  const lines = content.split('\n');
  const hasError = lines.some(l => classifyLine(l) === 'error');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>{hasError ? '❌' : '✅'}</span>
        <span className={styles.label}>Result</span>
        <span className={styles.meta}>{lines.length} lines</span>
      </div>
      <div className={styles.resultBlock}>
        {lines.map((line, i) => {
          const cls = classifyLine(line);
          return (
            <div key={i} className={
              cls === 'error' ? styles.resultError :
              cls === 'warning' ? styles.resultWarning :
              cls === 'success' ? styles.resultSuccess :
              styles.resultNormal
            }>
              {line || '\u00A0'}
            </div>
          );
        })}
      </div>
    </div>
  );
}
