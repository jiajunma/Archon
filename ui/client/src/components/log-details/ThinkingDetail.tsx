/**
 * ThinkingDetail — renders thinking/text content with paragraph structure
 *
 * Preserves whitespace but adds visual paragraph breaks.
 * Highlights code-like blocks (indented lines).
 */
import styles from './details.module.css';

interface Props {
  content: string;
  event: string;
}

export default function ThinkingDetail({ content, event }: Props) {
  // Split into paragraphs by double newline
  const paragraphs = content.split(/\n{2,}/);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>{event === 'thinking' ? '💭' : '💬'}</span>
        <span className={styles.label}>{event === 'thinking' ? 'Thinking' : 'Response'}</span>
        <span className={styles.meta}>{content.length} chars</span>
      </div>
      <div className={styles.thinkingBlock}>
        {paragraphs.map((para, i) => {
          const isCode = para.split('\n').every(l => l.startsWith('  ') || l.startsWith('\t') || l.trim() === '');
          return isCode ? (
            <pre key={i} className={styles.thinkingCode}>{para}</pre>
          ) : (
            <p key={i} className={styles.thinkingPara}>{para}</p>
          );
        })}
      </div>
    </div>
  );
}
