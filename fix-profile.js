const fs = require('fs');

const filePath = 'frontend/src/pages/Profile.jsx';

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const lines = data.split('\n');

    // Remove duplicate API_BASE and API declarations
    // Assuming they are at lines 39 and 40 (0-indexed 38 and 39)
    // Re-verify line numbers if the file structure changes.
    // Based on previous Select-String output, they are at original lines 40 and 41.
    // So for 0-indexed array, that's lines[39] and lines[40].
    // But given the last `node -e` command outputting lines 35, 36, 40, 41,
    // and the previous manual `edit` command, the lines to remove are 40 and 41 (1-indexed).
    // For `lines.splice(index, count)` for 0-indexed array:
    // If lines 40, 41 are duplicates, and lines 35, 36 are originals, remove starting at index 39 for 2 lines.
    lines.splice(39, 2);

    fs.writeFile(filePath, lines.join('\n'), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('frontend/src/pages/Profile.jsx cleaned successfully.');
    });
});