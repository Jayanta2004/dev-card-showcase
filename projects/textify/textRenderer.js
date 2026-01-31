const TextRenderer = {
    charSets: {
        high: '@%#*+=-:. ',
        medium: '@#*+=-:. ',
        low: '@#*. ',
        blocks: '█▓▒░ '
    },

    mapBrightnessToChar(brightness, charSetKey, invert) {
        const charSet = this.charSets[charSetKey] || this.charSets.medium;
        const chars = charSet.split('');

        let adjustedBrightness = brightness;
        if (invert) {
            adjustedBrightness = 255 - brightness;
        }

        const index = Math.floor((adjustedBrightness / 255) * (chars.length - 1));
        const clampedIndex = Math.max(0, Math.min(chars.length - 1, index));

        return chars[clampedIndex];
    },

    renderTextPortrait(pixelData, settings) {
        const { charSet, invert, textSize } = settings;

        let textContent = '';

        for (let y = 0; y < pixelData.length; y++) {
            const row = pixelData[y];
            for (let x = 0; x < row.length; x++) {
                const pixel = row[x];
                const char = this.mapBrightnessToChar(pixel.brightness, charSet, invert);
                textContent += char;
            }
            textContent += '\n';
        }

        return textContent;
    },

    renderToDOM(container, pixelData, settings) {
        const { charSet, invert, textSize } = settings;

        container.innerHTML = '';
        container.classList.add('has-content');

        const fragment = document.createDocumentFragment();

        for (let y = 0; y < pixelData.length; y++) {
            const row = pixelData[y];
            const lineDiv = document.createElement('div');
            lineDiv.style.fontSize = `${textSize}px`;
            lineDiv.style.lineHeight = '1';
            lineDiv.style.whiteSpace = 'pre';

            let lineText = '';
            for (let x = 0; x < row.length; x++) {
                const pixel = row[x];
                const char = this.mapBrightnessToChar(pixel.brightness, charSet, invert);
                lineText += char;
            }

            lineDiv.textContent = lineText;
            fragment.appendChild(lineDiv);
        }

        container.appendChild(fragment);
    },

    getTextContent(container) {
        const lines = container.querySelectorAll('div');
        let text = '';
        lines.forEach((line, index) => {
            text += line.textContent;
            if (index < lines.length - 1) {
                text += '\n';
            }
        });
        return text;
    }
};
