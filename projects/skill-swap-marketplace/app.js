// Skill Swap Marketplace
const form = document.getElementById('swap-form');
const offerInput = document.getElementById('offer');
const requestInput = document.getElementById('request');
const locationInput = document.getElementById('location');
const contactInput = document.getElementById('contact');
const listingList = document.getElementById('listing-list');

let listings = JSON.parse(localStorage.getItem('skillSwapListings') || '[]');

function renderListings() {
    listingList.innerHTML = '';
    listings.forEach((listing, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Offer:</strong> ${listing.offer} <br>
                        <strong>Request:</strong> ${listing.request} <br>
                        <strong>Location:</strong> ${listing.location} <br>
                        <strong>Contact:</strong> <a href="mailto:${listing.contact}">${listing.contact}</a>`;
        listingList.appendChild(li);
    });
}

function addListing(offer, request, location, contact) {
    listings.push({ offer, request, location, contact });
    localStorage.setItem('skillSwapListings', JSON.stringify(listings));
    renderListings();
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const offer = offerInput.value.trim();
    const request = requestInput.value.trim();
    const location = locationInput.value.trim();
    const contact = contactInput.value.trim();
    if (offer && request && location && contact) {
        addListing(offer, request, location, contact);
        offerInput.value = '';
        requestInput.value = '';
        locationInput.value = '';
        contactInput.value = '';
    }
});

renderListings();