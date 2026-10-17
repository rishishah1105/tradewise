const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(f => f.endsWith('.tsx'));
}

const files = getFiles('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Fix rounding on cards/panels
  content = content.replace(/className=[\"\{\`][^\`\"\}]*bg-brand-(card|dark)[^\`\"\}]*[\`\"\}]/g, (match) => {
    return match.replace(/rounded-(xl|2xl|3xl)/g, 'rounded-lg');
  });

  // 2. Fix Typography hierarchy
  // h1/h2 equivalents: font-bold text-2xl text-brand-light
  content = content.replace(/<h[12][^>]*className=[\"\{\`][^\`\"\}]*[\`\"\}]/g, (match) => {
    let res = match.replace(/font-(extrabold|black|medium|normal)/g, 'font-bold');
    if (!res.includes('text-brand-light')) res = res.replace(/text-brand-\w+/, 'text-brand-light');
    if (!res.match(/text-(2xl|3xl|4xl)/)) res = res.replace(/text-\w+/, 'text-2xl');
    return res;
  });

  // Section headings (h3/h4): text-brand-light, font-semibold, text-lg
  content = content.replace(/<h[34][^>]*className=[\"\{\`][^\`\"\}]*[\`\"\}]/g, (match) => {
    let res = match.replace(/font-(extrabold|black|bold)/g, 'font-semibold');
    res = res.replace(/text-(xl|2xl|sm|xs|base)/g, 'text-lg');
    if (!res.includes('text-brand-light')) res = res.replace(/text-brand-\w+/, 'text-brand-light');
    return res;
  });

  // Body/description text: p tags -> text-brand-muted, font-normal, text-sm
  content = content.replace(/<p[^>]*className=[\"\{\`][^\`\"\}]*[\`\"\}]/g, (match) => {
    let res = match.replace(/text-(xs|base)/g, 'text-sm');
    res = res.replace(/font-(medium|semibold|bold)/g, 'font-normal');
    if (!res.includes('text-brand-muted') && !res.includes('text-brand-black')) {
      res = res.replace(/text-brand-\w+/, 'text-brand-muted');
    }
    return res;
  });

  // Stats numbers: strong tags -> text-brand-light, font-bold, font-mono
  content = content.replace(/<strong[^>]*className=[\"\{\`][^\`\"\}]*[\`\"\}]/g, (match) => {
    let res = match.replace(/font-(extrabold|black|medium)/g, 'font-bold');
    if (!res.includes('font-mono')) {
        res = res.replace('font-bold', 'font-bold font-mono');
    }
    if (!res.includes('text-brand-light') && !res.includes('text-brand-green') && !res.includes('text-brand-red') && !res.includes('text-[#10b981]') && !res.includes('text-[#ef4444]')) {
      res = res.replace(/text-brand-\w+/, 'text-brand-light');
    }
    return res;
  });

  // Metadata labels: small text blocks (e.g. tracking-wider text-xs uppercase)
  content = content.replace(/<span[^>]*className=[\"\{\`][^\`\"\}]*uppercase tracking-wider[^\`\"\}]*[\`\"\}]/g, (match) => {
      let res = match.replace(/text-(sm|base)/g, 'text-xs');
      if (!res.includes('text-brand-muted')) res = res.replace(/text-brand-\w+/, 'text-brand-muted');
      return res;
  });


  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
console.log('Done UI Polish');
