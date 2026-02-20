`const workflowCanvas = document.getElementById('workflowCanvas');
const workflowOutput = document.getElementById('workflowOutput');
const runWorkflowBtn = document.getElementById('runWorkflowBtn');
const clearWorkflowBtn = document.getElementById('clearWorkflowBtn');
const integrationSelect = document.getElementById('integrationSelect');

let workflowBlocks = [];

// Add block to canvas
Array.from(document.getElementsByClassName('block-btn')).forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const integration = integrationSelect.value;
        addBlock(type, integration);
    });
});

function addBlock(type, integration) {
    const block = document.createElement('div');
    block.className = 'workflow-block';
    block.setAttribute('data-type', type);
    block.textContent = `${capitalize(type)} (${integration})`;
    workflowCanvas.appendChild(block);
    workflowBlocks.push({ type, integration });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

runWorkflowBtn.addEventListener('click', () => {
    if (workflowBlocks.length === 0) {
        workflowOutput.textContent = 'Add blocks to build your workflow.';
        return;
    }
    // Simulate workflow execution
    let output = 'Workflow executed:\n';
    workflowBlocks.forEach((block, i) => {
        output += `${i+1}. ${capitalize(block.type)} via ${block.integration}\n`;
    });
    workflowOutput.textContent = output;
});

clearWorkflowBtn.addEventListener('click', () => {
    workflowCanvas.innerHTML = '';
    workflowBlocks = [];
    workflowOutput.textContent = '';
});
