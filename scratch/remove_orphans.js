const fs = require('fs');

let content = fs.readFileSync('js/buyer.js', 'utf8');
let lines = content.split(/\r?\n/);

const startLineIndex = lines.findIndex(l => l.includes('<div class="dpp-timeline" id="dpp-os-timeline">'));

if (startLineIndex !== -1) {
    // We want to delete the lines after the loading spinner (startLineIndex + 1)
    // up to the line before the final closing div of dpp-timeline.
    // The final closing div is right before the line:
    // '          </div>' +
    // '        </div>' +
    // '      </div>' +
    // '    </div>\';'
    
    // So let's look for the final closing div sequence.
    let endIndex = startLineIndex + 1;
    for (let i = startLineIndex + 1; i < lines.length; i++) {
        if (lines[i].includes('\'</div>\';')) { // This is actually '    \'</div>\';'
            // We want to keep:
            // '            \'</div>\' +'
            // '          \'</div>\' +'
            // '        \'</div>\' +'
            // '      \'</div>\' +'
            // '    \'</div>\';'
            endIndex = i - 4; // Pointing to '            \'</div>\' +'
            break;
        }
    }
    
    if (endIndex > startLineIndex + 2) {
        console.log(`Deleting from line ${startLineIndex + 2} to ${endIndex - 1}`);
        lines.splice(startLineIndex + 2, endIndex - (startLineIndex + 2));
        fs.writeFileSync('js/buyer.js', lines.join('\n'));
        console.log('Fixed orphaned static nodes.');
    } else {
        console.log('Could not determine bounds properly. Start:', startLineIndex, 'End:', endIndex);
    }
}
