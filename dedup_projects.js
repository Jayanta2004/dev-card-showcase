const fs = require('fs');
const path = require('path');

const filePath = path.join('d:\\Applications\\Xammp\\htdocs\\dev-card-showcase', 'projects.json');

try {
    console.log(`Reading file from: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf8');

    // Check for BOM and remove if present
    const cleanData = rawData.charCodeAt(0) === 0xFEFF ? rawData.slice(1) : rawData;

    console.log(`File length: ${cleanData.length}`);

    let projects;
    try {
        projects = JSON.parse(cleanData);
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError.message);
        // Print context of error if possible
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            console.log(`Error context: ...${cleanData.substring(pos - 20, pos + 20)}...`);
        }
        process.exit(1);
    }

    console.log(`Original count: ${projects.length}`);

    const uniqueProjects = [];
    const seenTitles = new Set();
    let duplicates = 0;

    for (const project of projects) {
        if (!project.title) {
            console.log("Skipping project without title:", JSON.stringify(project));
            continue;
        }
        if (!seenTitles.has(project.title)) {
            seenTitles.add(project.title);
            uniqueProjects.push(project);
        } else {
            console.log(`Duplicate found: ${project.title}`);
            duplicates++;
        }
    }

    console.log(`Removed ${duplicates} duplicates.`);
    console.log(`New count: ${uniqueProjects.length}`);

    fs.writeFileSync(filePath, JSON.stringify(uniqueProjects, null, 4));
    console.log('Successfully wrote cleaned projects.json');

} catch (error) {
    console.error('General Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
}
