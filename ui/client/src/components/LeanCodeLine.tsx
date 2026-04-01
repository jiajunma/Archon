import { useMemo } from 'react';
import { highlightLeanLine } from '../utils/leanHighlight';
import styles from './LeanCodeLine.module.css';

export default function LeanCodeLine({ text }: { text: string }) {
  const tokens = useMemo(() => highlightLeanLine(text), [text]);
  return (
    <span>
      {tokens.map((token, i) => (
        <span key={i} className={token.cls ? styles[token.cls] : undefined}>{token.text}</span>
      ))}
    </span>
  );
}
