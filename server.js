const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Serve main forum page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to get notebook files for forum topics
app.get('/api/notebooks', (req, res) => {
    const notebooksPath = '/home/user/Repository/notebooks';
    
    function getFilesRecursively(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                getFilesRecursively(filePath, fileList);
            } else if (file.endsWith('.txt') || file.endsWith('.md')) {
                const relativePath = path.relative(notebooksPath, filePath);
                const content = fs.readFileSync(filePath, 'utf8');
                
                fileList.push({
                    path: relativePath,
                    name: file,
                    preview: content.substring(0, 200) + '...',
                    size: stat.size,
                    modified: stat.mtime
                });
            }
        });
        
        return fileList;
    }
    
    try {
        const files = getFilesRecursively(notebooksPath);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get specific file content
app.get('/api/file/*', (req, res) => {
    const filePath = path.join('/home/user/Repository/notebooks', req.params[0]);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ content });
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

const PORT = 8030;
app.listen(PORT, () => {
    console.log(`Simple forum running on http://localhost:${PORT}`);
});