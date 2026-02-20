const valueInput = document.getElementById('valueInput');
const unitInput = document.getElementById('unitInput');

const bytesOutput = document.getElementById('bytes');
const kbOutput = document.getElementById('kb');
const mbOutput = document.getElementById('mb');
const gbOutput = document.getElementById('gb');

function convertFileSize() {
    let value = parseFloat(valueInput.value);
    if (isNaN(value)) value = 0;

    const unit = unitInput.value;
    let bytes = 0;

    switch(unit) {
        case "B": bytes = value; break;
        case "KB": bytes = value * 1024; break;
        case "MB": bytes = value * 1024 * 1024; break;
        case "GB": bytes = value * 1024 * 1024 * 1024; break;
    }

    // Update outputs with 2 decimal places
    bytesOutput.textContent = bytes.toLocaleString();
    kbOutput.textContent = (bytes / 1024).toLocaleString(undefined, {maximumFractionDigits:2});
    mbOutput.textContent = (bytes / (1024 * 1024)).toLocaleString(undefined, {maximumFractionDigits:2});
    gbOutput.textContent = (bytes / (1024 * 1024 * 1024)).toLocaleString(undefined, {maximumFractionDigits:2});
}

// Listen for changes
valueInput.addEventListener('input', convertFileSize);
unitInput.addEventListener('change', convertFileSize);
