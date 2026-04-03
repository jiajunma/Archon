import { createSorryScannerState, scanLineForSorry } from './sorryScanner';

export interface HighlightToken {
  text: string;
  cls?: string;
}

const KEYWORD_RE = /\b(import|universe|namespace|section|end|open|variable|variables|parameter|parameters|axiom|theorem|lemma|example|def|instance|class|structure|inductive|abbrev|alias|noncomputable|by|where|fun|match|with|if|then|else|let|in|have|show|from|intro|simp|simpa|rw|rfl|exact|apply|constructor|cases|induction|calc|do|termination_by|decreasing_by)\b/g;
const DECL_KIND_RE = /\b(lemma|theorem|example|def|instance|class|structure|inductive|abbrev)\b/g;
const LINE_COMMENT_RE = /(--.*$)/g;
const BLOCK_COMMENT_RE = /\/\-[\s\S]*?\-\//g;

interface MatchSpan {
  start: number;
  end: number;
  cls: string;
}

function collect(regex: RegExp, text: string, cls: string): MatchSpan[] {
  regex.lastIndex = 0;
  const spans: MatchSpan[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    spans.push({ start: match.index, end: match.index + match[0].length, cls });
    if (match.index === regex.lastIndex) regex.lastIndex++;
  }
  return spans;
}

export function highlightLeanLine(text: string): HighlightToken[] {
  if (!text) return [{ text: '' }];

  const sorrySpans = scanLineForSorry(text, createSorryScannerState()).map(({ column }) => ({
    start: column - 1,
    end: column - 1 + 'sorry'.length,
    cls: 'sorry',
  }));

  const blockCommentOnly = text.trim().startsWith('/-') || text.trim().endsWith('-/');
  const spans = [
    ...collect(BLOCK_COMMENT_RE, text, 'comment'),
    ...collect(LINE_COMMENT_RE, text, 'comment'),
    ...(blockCommentOnly ? [{ start: 0, end: text.length, cls: 'comment' }] : []),
    ...sorrySpans,
    ...collect(DECL_KIND_RE, text, 'decl'),
    ...collect(KEYWORD_RE, text, 'kw'),
  ].sort((a, b) => a.start - b.start || b.end - a.end);

  const filtered: MatchSpan[] = [];
  for (const span of spans) {
    const overlap = filtered.some(existing => !(span.end <= existing.start || span.start >= existing.end));
    if (!overlap) filtered.push(span);
  }
  filtered.sort((a, b) => a.start - b.start);

  const out: HighlightToken[] = [];
  let cursor = 0;
  for (const span of filtered) {
    if (span.start > cursor) out.push({ text: text.slice(cursor, span.start) });
    out.push({ text: text.slice(span.start, span.end), cls: span.cls });
    cursor = span.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out.length ? out : [{ text }];
}
