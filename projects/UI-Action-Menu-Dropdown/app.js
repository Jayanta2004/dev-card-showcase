const $field = document.querySelector('.field.menu');
const $sharingSelect = $field.querySelector('#sharing');
const $sharingLabel = $field.querySelector('#sharing-label');
const $sharingButton = $field.querySelector('#sharing-toggle');
const $menu = $field.querySelector('#sharing-menu');
const $options = $menu.querySelectorAll('li');



let initialValue = $sharingSelect.value;

const toggleMenu = () => {
    if ( $field.classList.contains('open') ) {
        return closeMenu();
    }
    return openMenu();
}
const closeMenu = () => {
    $field.classList.remove('open');
    $sharingButton.setAttribute( 'aria-expanded', false );
}
const openMenu = () => {
    $field.classList.add('open');
    $sharingButton.setAttribute( 'aria-expanded', true );
    initialValue = $sharingSelect.value;
}
const resetMenu = () => {
    closeMenu();
    $sharingSelect.selectedIndex = 0;
    initialValue = $sharingSelect.value;
    syncValues();
}

document.body.addEventListener( 'click', (e) => {
    const $target = e.target;
    if ( $target === $sharingButton ) {
        toggleMenu();
    } else  {
        closeMenu();
    }
});

$sharingButton.addEventListener( 'keydown', (e) => {
    const isOpen =  $field.classList.contains('open');
    if ( e.key === 'ArrowDown' ) {
        e.preventDefault();
        if ( isOpen ) {
            const $firstOption = [...$options].at(0);
            $firstOption.focus();
            setOption($firstOption);
        } else {
            openMenu();
        }
    } else if ( e.key === 'Escape' ) {
        e.preventDefault();
        closeMenu();
    }
});
    
const syncValues = () => {
    const value = $sharingSelect.value;
    $sharingButton.innerText = value;
}

const resetValues = () => {
    const value = initialValue;
    $sharingButton.innerText = value;
    $sharingSelect.value = value;
}

const setOption = ($optionEl) => {
    const option = $optionEl.dataset.option;
    const value = $sharingSelect.querySelector(`[data-option=${option}]`).innerText;
    $sharingSelect.value = value;
    
    const $selectedOption = [...$options].filter((el) => el.dataset.option === option);
    $options.forEach(el => el.classList.remove('selected'));
    $selectedOption.at(0)?.classList.add('selected');
    
    syncValues();
}

const nextOption = ($optionEl) => {
    const $next = $optionEl.nextElementSibling;
    if ( $next ) {
        setOption( $next );
        $next.focus();
    }
};

const prevOption = ($optionEl) => {
    const $prev = $optionEl.previousElementSibling;
    if ( $prev ) {
        setOption( $prev );
        $prev.focus();
    }
};

$options.forEach(($el) => {
    
    $el.addEventListener( 'click', (e) => {
        setOption($el);
        $sharingButton.focus();
    });
    
    $el.addEventListener( 'keydown', (e) => {
        
        let shouldClose = false;
        
        if (e.key === 'Enter' || e.key === ' ') {
            setOption($el);
            shouldClose = true;
            e.preventDefault();
        } else if ( e.key === 'ArrowLeft' || e.key === 'ArrowUp' ) {
            prevOption($el);
            e.preventDefault();
        } else if ( e.key === 'ArrowRight' || e.key === 'ArrowDown' ) {
            nextOption($el);
            e.preventDefault();
        } else if ( e.key === 'Tab' ) {
            const index =  [...$options].indexOf($el);
            const length = $options.length;
            if ( index === length - 1 && !e.shiftKey ) {
                shouldClose = true;
            } else if ( index === 0 && e.shiftKey ) {
                shouldClose = true;
            }
        } else if ( e.key === 'Escape' ) {
            shouldClose = true;
            resetValues();
        }
        
        if ( shouldClose ) {
            closeMenu();
            $sharingButton.focus();
        }
    });
    
});

/* open for preview pane */

setTimeout(() => {
    openMenu();
    $sharingButton.focus();
}, 1000 );































// ----------------------------------------
// change colors as the slider moves
// ----------------------------------------

const $hue = document.querySelector('#hue');
$hue.addEventListener( 'input', event => {
    requestAnimationFrame(() => {
        document.body.style.setProperty('--hue', event.target.value );
    })
});

setTimeout(() => {
    document.querySelector('.inline-ranges').classList.add('show');
}, 2000);


// ----------------------------------------
// reset button function
// ----------------------------------------

const $reset = document.querySelector('#reset');
$reset.addEventListener( 'click', event => {
    document.body.style.setProperty('--hue', 210 );
    $hue.value = 210;
    resetMenu();
});


// ----------------------------------------
// toggle select/button function
// ----------------------------------------

const $toggleSelect = document.querySelector('#toggle');
let isReplaced = false;

const toggleSelect = () => {
    isReplaced = !isReplaced;
    syncValues();
    $sharingSelect.toggleAttribute('hidden');
    $sharingSelect.setAttribute('aria-hidden', isReplaced);
    $sharingButton.toggleAttribute('hidden');
    $sharingButton.setAttribute('aria-hidden', !isReplaced);
    $sharingLabel.setAttribute('for', 'sharing-toggle');
    if ( !isReplaced ) {
        $toggleSelect.innerText = 'show custom';
    } else {
        $toggleSelect.innerText = 'show select';
    }
}
toggleSelect();

$toggleSelect.addEventListener( 'click', event => {
    toggleSelect();
});

// ----------------------------------------
// toggle theme
// ----------------------------------------

const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
const $themeToggle = document.querySelector('#theme-toggle');
$themeToggle.checked = darkMode.matches;
document.body.classList.add('themed');