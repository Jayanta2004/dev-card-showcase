const container = document.getElementById('skill-tree-container');
const tooltip = document.getElementById('tooltip');
const generateBtn = document.getElementById('generate-btn');

generateBtn.addEventListener('click', () => {
    container.innerHTML = '';
    const input = document.getElementById('skill-input').value.trim();
    if (!input) return;

    const skillLines = input.split('\n');
    const skills = [];
    const skillMap = {};

    // Parse input
    skillLines.forEach((line, index) => {
        const [name, levelStr, parent] = line.split(',').map(s => s.trim());
        const level = parseInt(levelStr) || 0;
        const skill = { id: index+1, name, level, parent: parent || null, children: [], x: 0, y: 0 };
        skills.push(skill);
        skillMap[name] = skill;
    });

    // Build children
    skills.forEach(skill => {
        if (skill.parent) skillMap[skill.parent].children.push(skill);
    });

    // Tree layout algorithm (simple top-down)
    const rootSkills = skills.filter(s => !s.parent);
    let startX = 50;
    const spacingX = 180;
    const spacingY = 120;

    function layoutTree(skill, depth = 0, xOffset = 0) {
        skill.y = depth * spacingY + 50;

        if (skill.children.length === 0) {
            skill.x = xOffset;
            return xOffset + spacingX;
        } else {
            let childXOffset = xOffset;
            skill.children.forEach(child => {
                childXOffset = layoutTree(child, depth + 1, childXOffset);
            });
            // Center parent above its children
            const firstChild = skill.children[0];
            const lastChild = skill.children[skill.children.length - 1];
            skill.x = (firstChild.x + lastChild.x) / 2;
            return childXOffset;
        }
    }

    rootSkills.forEach(root => {
        startX = layoutTree(root, 0, startX);
    });

    // Render nodes
    skills.forEach(skill => {
        const node = document.createElement('div');
        node.classList.add('skill-node');
        node.style.left = skill.x + 'px';
        node.style.top = skill.y + 'px';
        node.innerHTML = `<strong>${skill.name}</strong>
                          <div class="progress-bar"><div class="progress-fill" style="width:${skill.level}%"></div></div>`;

        node.addEventListener('mouseenter', e => {
            tooltip.style.opacity = 1;
            tooltip.innerHTML = `<strong>${skill.name}</strong><br>Progress: ${skill.level}%`;
        });
        node.addEventListener('mousemove', e => {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY + 10 + 'px';
        });
        node.addEventListener('mouseleave', () => {
            tooltip.style.opacity = 0;
        });

        container.appendChild(node);
    });

    // Draw connectors
    skills.forEach(skill => {
        skill.children.forEach(child => drawConnector(skill, child));
    });
});

function drawConnector(parent, child) {
    const connector = document.createElement('div');
    connector.classList.add('connector');

    const x1 = parent.x + 75;
    const y1 = parent.y + 30;
    const x2 = child.x + 75;
    const y2 = child.y + 30;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    connector.style.width = length + 'px';
    connector.style.height = '3px';
    connector.style.left = x1 + 'px';
    connector.style.top = y1 + 'px';
    connector.style.transform = `rotate(${angle}deg)`;

    container.appendChild(connector);
}