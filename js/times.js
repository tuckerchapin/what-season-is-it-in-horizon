function calculateTimes() {
    let now = new Date();

    // Calculate the number of seasons (weeks) since the seed time.
    let numberOfSeasonsPassed = Math.floor(Math.abs(
        (now - winterStarts) / (7 * 24 * 60 * 60 * 1000)
    ));

    currentSeason = seasons[numberOfSeasonsPassed % 4];

    // Calculate the next season.
    let nextSeason = seasons[(numberOfSeasonsPassed + 1) % 4];
    let nextSeasonStart = winterStarts;
    nextSeasonStart.setDate(nextSeasonStart.getDate() + ((numberOfSeasonsPassed + 1) * 7));

    // How much time until the next season.
    let timeTilNextSeason = nextSeasonStart - now;
    let days = Math.floor(timeTilNextSeason / (24 * 60 * 60 * 1000));
    let hours = Math.floor((timeTilNextSeason / (60 * 60 * 1000)) - (days * 24));
    let minutes = Math.floor((timeTilNextSeason / (60 * 1000)) - (hours * 60) - (days * 24 * 60));

    return {
        currentSeason,
        nextSeason,
        days,
        hours,
        minutes
    }
}
