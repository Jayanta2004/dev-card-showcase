// Resources Component
class Resources {
    constructor(container) {
        this.container = container;
        this.resources = [
            { name: 'Mind', url: 'https://www.mind.org.uk/' },
            { name: 'SAMH', url: 'https://www.samh.org/' },
            { name: 'NAMI', url: 'https://www.nami.org/' },
            { name: 'Mental Health America', url: 'https://www.mhanational.org/' },
            { name: 'BetterHelp', url: 'https://www.betterhelp.com/' }
        ];
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="resources-header">Mental Health Resources</div>
            <ul class="resources-list">
                ${this.resources.map(r => `<li><a href="${r.url}" target="_blank">${r.name}</a></li>`).join('')}
            </ul>
        `;
    }
}

export default Resources;
