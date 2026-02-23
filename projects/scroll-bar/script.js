  (function() {
    // DOM elements
    const scrollArea = document.getElementById('scrollPreview');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeVal = document.getElementById('sizeVal');
    const liveSizeLabel = document.getElementById('liveSizeLabel');

    const thumbColor = document.getElementById('thumbColor');
    const trackColor = document.getElementById('trackColor');
    const thumbHoverColor = document.getElementById('thumbHoverColor');

    const thumbRadius = document.getElementById('thumbRadius');
    const trackRadius = document.getElementById('trackRadius');
    const thumbRadiusVal = document.getElementById('thumbRadiusVal');
    const trackRadiusVal = document.getElementById('trackRadiusVal');

    const cssOutput = document.getElementById('cssOutput');
    const copyBtn = document.getElementById('copyBtn');
    const trackName = document.getElementById('trackName'); // optional span

    // preset buttons
    const warmBtn = document.getElementById('presetWarm');
    const coolBtn = document.getElementById('presetCool');

    // We'll use CSS custom properties on scrollArea (they cascade to pseudo-elements)
    // Also set Firefox scrollbar-color via style property (scrollbar-color, scrollbar-width)
    function updateScrollbarStyle() {
      // read values
      const size = sizeSlider.value + 'px';
      const tColor = thumbColor.value;
      const trColor = trackColor.value;
      const thHover = thumbHoverColor.value;
      const thumbR = thumbRadius.value + 'px';
      const trackR = trackRadius.value + 'px';

      // update labels
      sizeVal.innerText = size;
      liveSizeLabel.innerText = size;
      thumbRadiusVal.innerText = thumbR;
      trackRadiusVal.innerText = trackR;
      if (trackName) trackName.innerText = trColor;

      // set custom properties on scrollArea (affect webkit pseudos)
      scrollArea.style.setProperty('--sb-size', size);
      scrollArea.style.setProperty('--sb-thumb', tColor);
      scrollArea.style.setProperty('--sb-track', trColor);
      scrollArea.style.setProperty('--sb-thumb-hover', thHover);
      scrollArea.style.setProperty('--sb-thumb-radius', thumbR);
      scrollArea.style.setProperty('--sb-track-radius', trackR);

      // firefox support: scrollbar-width (accepts auto, thin, none, or a length? Actually only keywords. Use <length>? Not widely. We'll set width via 'thin' or 'auto' but we can approximate using 'thin' for small, but we want exact. better use custom width via standard property? Not supported. fallback: we set width as 'auto' and rely on color. For better FF, we can set scrollbar-width to 'auto' or 'thin' but we cannot set px. We'll keep 'auto' and use scrollbar-color.
      // But we can try to set scrollbar-width to 'thin' if size < 10? Actually not exact. we ignore for simplicity and set color.
      scrollArea.style.scrollbarColor = `${tColor} ${trColor}`;
      // optional scrollbarWidth: 'auto' by default, we can set 'thin' if size <= 8? but users want exact size, but FF ignores. We'll set as 'auto' and note.
      // for better attempt, set via style
      if (parseInt(sizeSlider.value) <= 8) {
        scrollArea.style.scrollbarWidth = 'thin';
      } else {
        scrollArea.style.scrollbarWidth = 'auto';
      }

      // update code block
      const code = `/* webkit scrollbar (chrome, edge, safari) */
::-webkit-scrollbar {
  width: ${size};
}
::-webkit-scrollbar-track {
  background: ${trColor};
  border-radius: ${trackR};
}
::-webkit-scrollbar-thumb {
  background: ${tColor};
  border-radius: ${thumbR};
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background: ${thHover};
  background-clip: padding-box;
}

/* firefox */
* {
  scrollbar-width: ${parseInt(sizeSlider.value) <= 8 ? 'thin' : 'auto'};
  scrollbar-color: ${tColor} ${trColor};
}`;
      cssOutput.innerText = code;
    }

    // attach events
    [sizeSlider, thumbColor, trackColor, thumbHoverColor, thumbRadius, trackRadius].forEach(el => {
      el.addEventListener('input', updateScrollbarStyle);
    });

    // preset: warm (already matches defaults, but we set explicit)
    warmBtn.addEventListener('click', () => {
      thumbColor.value = '#ffb347';
      trackColor.value = '#2c3e4c';
      thumbHoverColor.value = '#ffa01e';
      thumbRadius.value = 8;
      trackRadius.value = 8;
      sizeSlider.value = 16;
      updateScrollbarStyle();
    });

    coolBtn.addEventListener('click', () => {
      thumbColor.value = '#47b5ff';
      trackColor.value = '#16313d';
      thumbHoverColor.value = '#8ad0ff';
      thumbRadius.value = 12;
      trackRadius.value = 4;
      sizeSlider.value = 14;
      updateScrollbarStyle();
    });

    // copy to clipboard
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(cssOutput.innerText).then(() => {
        const original = copyBtn.innerText;
        copyBtn.innerText = 'copied!';
        setTimeout(() => copyBtn.innerText = original, 1500);
      }).catch(() => alert('failed to copy'));
    });

    // initialize
    updateScrollbarStyle();

    // extra: update track name and hover preview already inside update function
  })();