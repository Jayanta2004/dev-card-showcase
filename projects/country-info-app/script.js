const input = document.getElementById("countryInput");
const card = document.getElementById("countryCard");

async function getCountry() {
  const countryName = input.value.trim();

  if (countryName === "") {
    alert("Please enter a country name");
    return;
  }

  const url = `https://restcountries.com/v3.1/name/${countryName}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const country = data[0];

    document.getElementById("flag").src = country.flags.png;
    document.getElementById("name").textContent = country.name.common;
    document.getElementById("capital").textContent = country.capital ? country.capital[0] : "N/A";
    document.getElementById("region").textContent = country.region;
    document.getElementById("population").textContent = country.population.toLocaleString();
    document.getElementById("currency").textContent = Object.values(country.currencies)[0].name;
    document.getElementById("language").textContent = Object.values(country.languages).join(", ");

    card.classList.remove("hidden");

  } catch (error) {
    alert("Country not found!");
    card.classList.add("hidden");
  }
}
