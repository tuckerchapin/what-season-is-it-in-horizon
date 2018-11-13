const seasons = ["winter", "spring", "summer", "autumn"];
const winterStarts = new Date(Date.UTC(2018, 10, 8, 14, 30, 00));
const now = new Date();

// Calculate the number of seasons (weeks) since the seed time.
let numberOfSeasonsPassed = Math.floor(Math.abs(
    (now - winterStarts) / (7 * 24 * 60 * 60 * 1000)
));

let currentSeason = seasons[numberOfSeasonsPassed % 4];

// Calculate the next season.
let nextSeason = seasons[(numberOfSeasonsPassed + 1) % 4];
let nextSeasonStart = winterStarts;
nextSeasonStart.setDate(nextSeasonStart.getDate() + ((numberOfSeasonsPassed + 1) * 7));

// How much time until the next season.
let timeTilNextSeason = nextSeasonStart - now;
let daysTilNextSeason = Math.floor(timeTilNextSeason / (24 * 60 * 60 * 1000));
let hoursTilNextSeason = Math.floor((timeTilNextSeason / (60 * 60 * 1000)) - (daysTilNextSeason * 24));
let minutesTilNextSeason = Math.floor((timeTilNextSeason / (60 * 1000)) - (hoursTilNextSeason * 60) - (daysTilNextSeason * 24 * 60));

// Format the time for display
let formattedTimeTil = `${daysTilNextSeason}D ${hoursTilNextSeason}H ${minutesTilNextSeason}M`
