        (function() {
            // ---------- NATURE PHOTO GALLERY WITH INFO (DATA) ----------
            const galleryData = [
                {
                    name: "Ancient Cascade",
                    location: "Plitvice Lakes, Croatia",
                    description: "Sixteen terraced lakes connected by travertine waterfalls. Ancient forest of beech and fir surrounds the turquoise water.",
                    imageDesc: "waterfall forest",
                    altitude: "640 m",
                    region: "karst",
                    tag: "UNESCO"
                },
                {
                    name: "Misty Taiga",
                    location: "Siberian Pine Forest, Russia",
                    description: "Dense coniferous woodland in early morning fog. Home to sable, elk, and the elusive Siberian tiger.",
                    imageDesc: "foggy pine trees",
                    altitude: "820 m",
                    region: "boreal",
                    tag: "taiga"
                },
                {
                    name: "Redwood Sanctuary",
                    location: "Prairie Creek, California",
                    description: "Old-growth coast redwoods — some over 300 ft tall. Fern-covered floor filters the light into a green cathedral.",
                    imageDesc: "tall redwoods",
                    altitude: "180 m",
                    region: "temperate rainforest",
                    tag: "national park"
                },
                {
                    name: "Lavender Dawn",
                    location: "Valensole Plateau, France",
                    description: "Endless rows of lavender blooming in July. The air is thick with scent and the hum of bees.",
                    imageDesc: "lavender field sunrise",
                    altitude: "590 m",
                    region: "provence",
                    tag: "aromatic"
                },
                {
                    name: "Basalt Columns",
                    location: "Fingal's Cave, Scotland",
                    description: "Hexagonal basalt pillars formed by ancient volcanic eruption. The cave's acoustics inspired Mendelssohn.",
                    imageDesc: "rock columns coast",
                    altitude: "sea level",
                    region: "Hebrides",
                    tag: "geology"
                },
                {
                    name: "Bamboo Grove",
                    location: "Arashiyama, Japan",
                    description: "Towering bamboo stalks sway and creak in the wind. Sunlight filters through the dense green canopy.",
                    imageDesc: "bamboo forest path",
                    altitude: "50 m",
                    region: "Kyoto",
                    tag: "sacred"
                },
                {
                    name: "Alpine Glow",
                    location: "Dolomites, Italy",
                    description: "Limestone peaks catching the last light (enrosadira). Pristine meadows dotted with edelweiss.",
                    imageDesc: "mountain peaks sunset",
                    altitude: "2,600 m",
                    region: "southern alps",
                    tag: "pale mountains"
                }
            ];

            // mapping of image keywords to unsplash / placeholder styling
            // we'll use inline background images with unsplash embed + consistent gradient overlay
            function getBackgroundImageStyle(placeName, keyword) {
                // create a richer unsplash lookup using slug and name; but for reliability we use unsplash collection + keyword.
                // using unsplash "nature" featured + keyword to keep it fresh.
                // But we need concrete images. Use unsplash API via collection? To keep demo self-contained, we use unsplash static nature images with keywords.
                // each image will be different based on keyword – unsplash provides nice photos.
                // we'll build a url with the keyword encoded.
                const base = "https://images.unsplash.com/";
                // pick different unsplash photo ids based on keyword to keep variety (fallback to generic nature)
                // we map to specific unsplash photo IDs for consistency and beauty.
                const map = {
                    "waterfall forest": "photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // plitvice-like
                    "foggy pine trees": "photo-1542640248-7c2da8b4c7f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // misty pines
                    "tall redwoods": "photo-1518495973542-4542d06fc3cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // redwood
                    "lavender field sunrise": "photo-1592595896616-c37162298647?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // lavender
                    "rock columns coast": "photo-1599343353410-6ef18e7fbb82?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // basalt columns
                    "bamboo forest path": "photo-1518537696-37552161bfaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // bamboo
                    "mountain peaks sunset": "photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // dolomites like
                };
                // fallback if keyword not found
                let photoId = map[keyword] || "photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                return `background-image: linear-gradient(0deg, rgba(0, 20, 15, 0.4) 0%, rgba(0, 30, 30, 0.1) 50%), url('https://images.unsplash.com/${photoId}'); background-size: cover; background-position: center;`;
            }

            // reference to grid container
            const grid = document.getElementById('galleryGrid');
            const statsEl = document.getElementById('galleryStats');
            const shuffleLink = document.getElementById('refreshHint');

            // render gallery based on current data order
            function renderGallery(dataArray) {
                let html = '';
                dataArray.forEach((item, idx) => {
                    const bgStyle = getBackgroundImageStyle(item.name, item.imageDesc);
                    html += `
                        <div class="card">
                            <div class="card-img" style="${bgStyle}">
                                <span class="img-tag">${item.tag}</span>
                            </div>
                            <div class="card-content">
                                <h2 class="card-title">${item.name}</h2>
                                <div class="location">📍 ${item.location}</div>
                                <p class="description">${item.description}</p>
                                <div class="meta-footer">
                                    <span class="elevation">⛰️ ${item.altitude}</span>
                                    <span class="featured-badge">${item.region}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                grid.innerHTML = html;
                statsEl.innerText = `${dataArray.length} wild places · info`;
            }

            // shuffle array (Fisher–Yates) and re-render
            function shuffleGallery() {
                const shuffled = [...galleryData];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                renderGallery(shuffled);
            }

            // initial render (original order)
            renderGallery(galleryData);

            // attach shuffle to link
            shuffleLink.addEventListener('click', (e) => {
                e.preventDefault();
                shuffleGallery();
            });

            // optional: extra stats update on shuffle already handled inside render

            // bonus: show number of cards and dynamic hover but fine
        })();