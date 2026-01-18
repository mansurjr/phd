const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const emotionDir = path.join(__dirname, 'public', 'emotions');
if (!fs.existsSync(emotionDir)) {
  fs.mkdirSync(emotionDir, { recursive: true });
}

const emotions = [
  { file: 'hayajon.jpg', text: 'Hayajon', color: '#FFD93D' },
  { file: 'charchoq.jpg', text: 'Charchoq', color: '#8D6E63' },
  { file: 'xavotir.jpg', text: 'Xavotir', color: '#FF6B6B' },
  { file: 'ikkilanish.jpg', text: 'Ikkilanish', color: '#FFB4A2' },
  { file: 'befarqlik.jpg', text: 'Befarqlik', color: '#95A5A6' }
];

async function createImages() {
  for (const emotion of emotions) {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${emotion.color}"/>
        <text x="200" y="150" font-size="48" font-weight="bold" text-anchor="middle" 
              dominant-baseline="middle" fill="white" font-family="Arial">${emotion.text}</text>
      </svg>
    `;
    
    const filePath = path.join(emotionDir, emotion.file);
    await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(filePath);
    console.log(`✓ Created: ${emotion.file}`);
  }
  console.log('\nAll emotion images created successfully!');
}

createImages().catch(err => console.error('Error:', err));
