const CODE_TOKEN_PREFIX = '__CHAT_CODE_TOKEN_';

type TokenMap = Map<string, string>;

export function formatChatMessage(raw: string): string {
  const normalized = (raw || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return '';
  }

  const escaped = escapeHtml(normalized);
  const codeTokens: TokenMap = new Map<string, string>();
  const inlineCodeTokens: TokenMap = new Map<string, string>();

  let content = tokenizeCodeBlocks(escaped, codeTokens);
  content = tokenizeInlineCode(content, inlineCodeTokens);
  content = renderBlocks(content);
  content = applyInlineFormatting(content);

  content = restoreTokens(content, inlineCodeTokens);
  content = restoreTokens(content, codeTokens);
  return content;
}

function tokenizeCodeBlocks(content: string, tokenMap: TokenMap): string {
  return content.replace(/```([a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, (_, lang: string | undefined, codeBody: string) => {
    const token = `${CODE_TOKEN_PREFIX}${tokenMap.size}__`;
    const safeLang = (lang || '').trim();
    const label = safeLang ? `<div style="font-size:11px;color:#64748b;margin-bottom:6px;">${safeLang}</div>` : '';
    const html = `<pre style="margin:8px 0;padding:10px;border-radius:10px;background:#0f172a;color:#e2e8f0;overflow:auto;"><code>${label}${codeBody.trim()}</code></pre>`;
    tokenMap.set(token, html);
    return token;
  });
}

function tokenizeInlineCode(content: string, tokenMap: TokenMap): string {
  return content.replace(/`([^`\n]+)`/g, (_, codeBody: string) => {
    const token = `${CODE_TOKEN_PREFIX}INLINE_${tokenMap.size}__`;
    tokenMap.set(
      token,
      `<code style="padding:2px 6px;border-radius:6px;background:#e2e8f0;color:#0f172a;font-size:12px;">${codeBody}</code>`
    );
    return token;
  });
}

function renderBlocks(content: string): string {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (/^###\s+/.test(line)) {
      blocks.push(`<h4 style="margin:8px 0 6px;font-size:15px;">${line.replace(/^###\s+/, '')}</h4>`);
      index += 1;
      continue;
    }

    if (/^##\s+/.test(line)) {
      blocks.push(`<h3 style="margin:8px 0 6px;font-size:16px;">${line.replace(/^##\s+/, '')}</h3>`);
      index += 1;
      continue;
    }

    if (/^#\s+/.test(line)) {
      blocks.push(`<h3 style="margin:8px 0 6px;font-size:17px;">${line.replace(/^#\s+/, '')}</h3>`);
      index += 1;
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+/);
    if (orderedMatch) {
      const listItems: string[] = [];
      while (index < lines.length && /^(\d+)\.\s+/.test(lines[index].trim())) {
        listItems.push(`<li>${lines[index].trim().replace(/^(\d+)\.\s+/, '')}</li>`);
        index += 1;
      }
      blocks.push(`<ol style="margin:6px 0 8px;padding-left:20px;">${listItems.join('')}</ol>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const listItems: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        listItems.push(`<li>${lines[index].trim().replace(/^[-*]\s+/, '')}</li>`);
        index += 1;
      }
      blocks.push(`<ul style="margin:6px 0 8px;padding-left:20px;">${listItems.join('')}</ul>`);
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() && !isBlockStarter(lines[index].trim())) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push(`<p style="margin:0 0 8px;">${paragraphLines.join('<br/>')}</p>`);
  }

  return blocks.join('');
}

function isBlockStarter(line: string): boolean {
  return /^#{1,3}\s+/.test(line) || /^(\d+)\.\s+/.test(line) || /^[-*]\s+/.test(line);
}

function applyInlineFormatting(content: string): string {
  let output = content;
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label: string, url: string) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`;
  });
  output = output.replace(/(^|\s)(https?:\/\/[^\s<]+)/g, (_, prefix: string, url: string) => {
    return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${url}</a>`;
  });
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return output;
}

function restoreTokens(content: string, tokenMap: TokenMap): string {
  let output = content;
  tokenMap.forEach((value, token) => {
    output = output.replace(new RegExp(token, 'g'), value);
  });
  return output;
}

function escapeHtml(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

