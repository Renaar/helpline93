import { Fragment } from 'react';
import { parseSpans } from './markdownLight.ts';
import { findMatches } from './search.ts';

/** Text with **bold** spans and search matches marked. */
export function RichText({ text, query }: { text: string; query: string }) {
  return (
    <>
      {parseSpans(text).map((span, index) => {
        const content = <Highlighted text={span.text} query={query} />;
        return span.bold ? (
          <strong key={index}>{content}</strong>
        ) : (
          <Fragment key={index}>{content}</Fragment>
        );
      })}
    </>
  );
}

export function Highlighted({ text, query }: { text: string; query: string }) {
  const ranges = findMatches(text, query);
  if (ranges.length === 0) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const [start, end] of ranges) {
    if (start > last) parts.push(text.slice(last, start));
    parts.push(<mark key={start}>{text.slice(start, end)}</mark>);
    last = end;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
