/**
 * @file templates.js
 * @description Provides structural HTML templates for different UI archetypes.
 * These templates are used by the Renderer to build the inner content of layout previews.
 */

const UITemplates = {
    /**
     * Classic High-Conversion Landing Page
     */
    landing: (traits) => `
        <div class="tpl-landing" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
            <header style="padding: var(--pad); display: flex; justify-content: space-between; align-items: center; border-bottom: var(--bw) solid rgba(0,0,0,0.1);">
                <div style="font-weight: 800; color: var(--p-color); font-size: 1.2em;">DNA.io</div>
                <div style="display: flex; gap: 0.5rem;">
                    <span style="width: 30px; height: 8px; background: var(--txt-color); opacity: 0.2; border-radius: 4px;"></span>
                    <span style="width: 30px; height: 8px; background: var(--txt-color); opacity: 0.2; border-radius: 4px;"></span>
                </div>
            </header>
            <main style="flex-grow: 1; display: flex; flex-direction: column; align-items: var(--hero-aln); justify-content: center; padding: calc(var(--pad) * 2); text-align: ${traits.heroAlign === 'center' ? 'center' : 'left'};">
                <h1 style="font-family: var(--font-h); font-weight: var(--fw-h); text-transform: var(--tt-h); font-size: 1.8em; margin-bottom: 0.5rem; line-height: 1.1;">Evolve Your Design</h1>
                <p style="font-size: 0.8em; opacity: 0.7; margin-bottom: 1.5rem; max-width: 80%;">The future of automated interface generation is here using genetic logic.</p>
                <div style="background: var(--gradient); color: white; padding: 0.8rem 1.5rem; border-radius: var(--br); font-weight: 700; font-size: 0.9em; box-shadow: var(--shd); cursor: pointer; display: inline-block;">
                    Get Started
                </div>
            </main>
            <section style="background: var(--card-bg); padding: var(--pad); display: grid; grid-template-columns: repeat(3, 1fr); gap: calc(var(--gap) / 2);">
                <div style="height: 40px; border-radius: var(--ir); border: var(--bw) solid var(--s-color); opacity: 0.3;"></div>
                <div style="height: 40px; border-radius: var(--ir); border: var(--bw) solid var(--s-color); opacity: 0.3;"></div>
                <div style="height: 40px; border-radius: var(--ir); border: var(--bw) solid var(--s-color); opacity: 0.3;"></div>
            </section>
        </div>
    `,

    /**
     * Modern Data-Rich Dashboard
     */
    dashboard: (traits) => `
        <div class="tpl-dashboard" style="display: grid; grid-template-columns: 60px 1fr; height: 100%; background: var(--bg-color);">
            <aside style="background: var(--p-color); opacity: 0.1; border-right: var(--bw) solid var(--txt-color); display: flex; flex-direction: column; align-items: center; padding: 1rem 0; gap: 1rem;">
                <div style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--p-color);"></div>
                <div style="width: 20px; height: 20px; background: var(--txt-color); opacity: 0.2; border-radius: 4px;"></div>
                <div style="width: 20px; height: 20px; background: var(--txt-color); opacity: 0.2; border-radius: 4px;"></div>
            </aside>
            <main style="padding: var(--pad); display: flex; flex-direction: column; gap: var(--gap);">
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <h2 style="font-family: var(--font-h); font-weight: var(--fw-h); font-size: 1.2em;">Analytics</h2>
                    <div style="font-family: 'JetBrains Mono'; font-size: 0.6em; opacity: 0.5;">v2.0.4 - GEN ${traits.generation || 1}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap);">
                    <div style="background: var(--card-bg); height: 80px; border-radius: var(--br); border: var(--bw) solid var(--border-bright); box-shadow: var(--shd); position: relative; overflow: hidden;">
                        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40%; background: var(--gradient); opacity: 0.2;"></div>
                    </div>
                    <div style="background: var(--card-bg); height: 80px; border-radius: var(--br); border: var(--bw) solid var(--border-bright); box-shadow: var(--shd);"></div>
                </div>
                <div style="background: var(--card-bg); flex-grow: 1; border-radius: var(--br); border: var(--bw) solid var(--border-bright); padding: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
                    <div style="width: 100%; height: 8px; background: var(--txt-color); opacity: 0.1; border-radius: 4px;"></div>
                    <div style="width: 80%; height: 8px; background: var(--txt-color); opacity: 0.1; border-radius: 4px;"></div>
                    <div style="width: 90%; height: 8px; background: var(--txt-color); opacity: 0.1; border-radius: 4px;"></div>
                </div>
            </main>
        </div>
    `,

    /**
     * Social Feed / Content Wall
     */
    feed: (traits) => `
        <div class="tpl-feed" style="background: var(--bg-color); height: 100%; display: flex; flex-direction: column; gap: calc(var(--gap) / 2); padding: var(--pad); overflow: hidden;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient);"></div>
                <div style="flex-grow: 1; height: 10px; background: var(--txt-color); opacity: 0.1; border-radius: 5px;"></div>
            </div>
            <div style="background: var(--card-bg); aspect-ratio: 16/9; border-radius: var(--br); box-shadow: var(--shd); margin-bottom: 0.5rem; backdrop-filter: var(--blur); border: var(--bw) solid rgba(255,255,255,0.05);"></div>
            <div style="height: 12px; width: 40%; background: var(--txt-color); opacity: 0.2; border-radius: 6px;"></div>
            <div style="height: 12px; width: 90%; background: var(--txt-color); opacity: 0.1; border-radius: 6px;"></div>
            <div style="height: 12px; width: 70%; background: var(--txt-color); opacity: 0.1; border-radius: 6px;"></div>
            <div style="display: flex; gap: 1rem; margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
                <div style="width: 20px; height: 20px; border-radius: 4px; background: var(--a-color);"></div>
                <div style="width: 20px; height: 20px; border-radius: 4px; background: var(--s-color);"></div>
            </div>
        </div>
    `,

    /**
     * Minimal Portfolio / Profile
     */
    profile: (traits) => `
        <div class="tpl-profile" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--pad); text-align: center; gap: 1rem;">
            <div style="width: 80px; height: 80px; border-radius: var(--br); background: var(--gradient); padding: 4px; box-shadow: var(--shd);">
                <div style="width: 100%; height: 100%; border-radius: calc(var(--br) - 4px); background: var(--bg-color);"></div>
            </div>
            <h1 style="font-family: var(--font-h); font-weight: var(--fw-h); font-size: 1.5em; color: var(--p-color);">Jane Doe</h1>
            <p style="font-family: var(--font-b); font-size: 0.8em; opacity: 0.6; line-height: 1.6;">Lead Evolver & UI Strategist.</p>
            <div style="display: flex; gap: 0.8rem;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--txt-color); opacity: 0.1;"></div>
                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--txt-color); opacity: 0.1;"></div>
                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--txt-color); opacity: 0.1;"></div>
            </div>
            <div style="margin-top: 1rem; border: var(--bw) solid var(--p-color); padding: 0.5rem 2rem; border-radius: var(--br); font-size: 0.7em; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                Contact Me
            </div>
        </div>
    `
};
