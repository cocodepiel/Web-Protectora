const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../content/animales');
const outputFile = path.join(__dirname, '../content/animals.json');

// Simple Frontmatter parser
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { attributes: {}, body: content };

    const frontmatter = match[1];
    const body = match[2].trim();
    const attributes = {};

    frontmatter.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join(':').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            attributes[key] = value;
        }
    });

    return { attributes, body };
}

try {
    const files = fs.readdirSync(contentDir);
    const animals = files.filter(file => file.endsWith('.md')).map(file => {
        const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
        const parsed = parseFrontmatter(content);
        return {
            filename: file,
            ...parsed.attributes,
            description: parsed.body
        };
    });

    fs.writeFileSync(outputFile, JSON.stringify(animals, null, 2));
    console.log(`Generated index for ${animals.length} animals.`);
} catch (err) {
    console.error('Error generating index:', err);
}
