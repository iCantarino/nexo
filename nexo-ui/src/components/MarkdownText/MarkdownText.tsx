import type { FunctionComponent, ReactNode } from 'react';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const parseMarkdown = (text: string): ReactNode[] => {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    const parts: ReactNode[] = [];
    let remaining = escapeHtml(line);
    let key = 0;

    const pushMatch = (match: RegExpExecArray, element: ReactNode) => {
      if (match.index > 0) {
        parts.push(<span key={`${lineIndex}-${key++}`}>{remaining.slice(0, match.index)}</span>);
      }
      parts.push(<span key={`${lineIndex}-${key++}`}>{element}</span>);
      remaining = remaining.slice(match.index + match[0].length);
    };

    // Links markdown: [texto](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch: RegExpExecArray | null;
    const linkMatches: { match: RegExpExecArray; index: number }[] = [];
    while ((linkMatch = linkRegex.exec(remaining)) !== null) {
      linkMatches.push({ match: linkMatch, index: linkMatch.index });
    }

    if (linkMatches.length > 0) {
      let currentIndex = 0;
      for (const { match } of linkMatches) {
        if (match.index > currentIndex) {
          parts.push(<span key={`${lineIndex}-${key++}`}>{remaining.slice(currentIndex, match.index)}</span>);
        }
        parts.push(
          <a
            key={`${lineIndex}-${key++}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#d97706', textDecoration: 'underline' }}
          >
            {match[1]}
          </a>
        );
        currentIndex = match.index + match[0].length;
      }
      if (currentIndex < remaining.length) {
        parts.push(<span key={`${lineIndex}-${key++}`}>{remaining.slice(currentIndex)}</span>);
      }
    } else {
      // Negrito **texto**
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let boldMatch: RegExpExecArray | null;
      while ((boldMatch = boldRegex.exec(remaining)) !== null) {
        pushMatch(boldMatch, <strong>{boldMatch[1]}</strong>);
        boldRegex.lastIndex = 0;
      }

      // Itálico *texto* (não confundir com **)
      const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
      let italicMatch: RegExpExecArray | null;
      while ((italicMatch = italicRegex.exec(remaining)) !== null) {
        pushMatch(italicMatch, <em>{italicMatch[1]}</em>);
        italicRegex.lastIndex = 0;
      }

      if (parts.length === 0) {
        parts.push(<span key={`${lineIndex}-${key++}`}>{remaining}</span>);
      } else if (remaining.length > 0) {
        parts.push(<span key={`${lineIndex}-${key++}`}>{remaining}</span>);
      }
    }

    return (
      <span key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};

const MarkdownText: FunctionComponent<MarkdownTextProps> = ({ text, className }) => (
  <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
    {parseMarkdown(text)}
  </span>
);

export default MarkdownText;
