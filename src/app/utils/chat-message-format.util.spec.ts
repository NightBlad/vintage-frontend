import { formatChatMessage } from './chat-message-format.util';

describe('formatChatMessage', () => {
  it('escapes unsafe html', () => {
    const html = formatChatMessage('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('renders markdown basics', () => {
    const html = formatChatMessage('# Title\n- one\n- two\n**bold** and *italic*');
    expect(html).toContain('<h3');
    expect(html).toContain('<ul');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('renders code block and inline code', () => {
    const html = formatChatMessage('```ts\nconst a = 1;\n```\nUse `npm run build`');
    expect(html).toContain('<pre');
    expect(html).toContain('const a = 1;');
    expect(html).toContain('<code style=');
    expect(html).toContain('npm run build');
  });

  it('renders safe links', () => {
    const html = formatChatMessage('Go to https://example.com or [docs](https://docs.example.com)');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('href="https://docs.example.com"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });
});

