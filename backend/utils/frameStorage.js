const fs = require('fs');
const path = require('path');

const FRAME_DIR = path.join(__dirname, '../captured_frames');

// Create directory if not exists
if (!fs.existsSync(FRAME_DIR)) {
    fs.mkdirSync(FRAME_DIR, { recursive: true });
    console.log('📁 Created captured_frames directory');
}

function saveFrame(base64Frame, incidentId) {
    try {
        const timestamp = Date.now();
        const filename = `incident_${incidentId}_${timestamp}.jpg`;
        const filepath = path.join(FRAME_DIR, filename);
        
        // Remove base64 prefix (data:image/jpeg;base64,)
        const base64Data = base64Frame.replace(/^data:image\/\w+;base64,/, '');
        
        // Save to disk
        fs.writeFileSync(filepath, base64Data, 'base64');
        
        console.log(`📸 Frame saved: ${filename}`);
        return { filename, filepath };
    } catch (error) {
        console.error('❌ Frame save error:', error.message);
        return null;
    }
}

function getFrame(filename) {
    try {
        const filepath = path.join(FRAME_DIR, filename);
        if (fs.existsSync(filepath)) {
            return filepath;
        }
        return null;
    } catch (error) {
        console.error('❌ Frame read error:', error.message);
        return null;
    }
}

function deleteOldFrames(daysOld = 7) {
    try {
        const files = fs.readdirSync(FRAME_DIR);
        const now = Date.now();
        const maxAge = daysOld * 24 * 60 * 60 * 1000;
        
        let deletedCount = 0;
        files.forEach(file => {
            const filepath = path.join(FRAME_DIR, file);
            const stats = fs.statSync(filepath);
            const age = now - stats.mtimeMs;
            
            if (age > maxAge) {
                fs.unlinkSync(filepath);
                deletedCount++;
            }
        });
        
        if (deletedCount > 0) {
            console.log(`🗑️ Deleted ${deletedCount} old frames (> ${daysOld} days)`);
        }
    } catch (error) {
        console.error('❌ Frame cleanup error:', error.message);
    }
}

module.exports = { saveFrame, getFrame, deleteOldFrames };
