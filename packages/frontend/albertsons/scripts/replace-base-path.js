import fs from 'fs';

const filePath = 'dist/static/base-path.js';

let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("window.BASE_PATH = '/{{BASE_PATH}}/';", "window.BASE_PATH = '/';");

fs.writeFileSync(filePath, content);

console.log('✅ BASE_PATH replaced');
