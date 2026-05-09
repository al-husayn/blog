const fs = require('node:fs');
const path = require('node:path');

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'blog', 'content');
const OUTPUT_DIR = path.join(process.cwd(), 'lib', 'generated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'read-times.json');
const WORDS_PER_MINUTE = 200;
const FRONTMATTER_REGEX = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

const stripFrontmatter = (content) => content.replace(FRONTMATTER_REGEX, '');

const calculateReadTime = (content) => {
    const text = stripFrontmatter(content);
    const words = text.match(/\b[\w'-]+\b/g);
    const wordCount = words?.length ?? 0;
    const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
    return { minutes, wordCount };
};

const main = () => {
    if (!fs.existsSync(BLOG_CONTENT_DIR)) {
        throw new Error(`Content directory not found: ${BLOG_CONTENT_DIR}`);
    }

    const files = fs.readdirSync(BLOG_CONTENT_DIR).filter((file) => file.endsWith('.mdx'));
    const result = {};

    files.forEach((file) => {
        const slug = file.replace(/\.mdx$/, '');
        const raw = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), 'utf8');
        const { minutes } = calculateReadTime(raw);
        result[slug] = `${minutes} min read`;
    });

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
};

main();
