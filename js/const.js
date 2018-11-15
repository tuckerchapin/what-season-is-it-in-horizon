const seasons = ["winter", "spring", "summer", "autumn"];
const winterStarts = new Date(Date.UTC(2018, 10, 8, 14, 30, 00));
let lastCheckedSeason;
let minuteInterval = 0;
let secondInterval = 0;

// List of the uploaded user's images
const userBackgrounds = {
    "winter": [
        "kml--1",
        "parkel42-1",
        "parkel42-2",
        // "parkel42-3", // Not a fan
        "CCXGT-1",
        "naixu-1",
    ],
    "spring": [
        // "-MattyMcFly-1", // Not 1080p; 1252x724
        "And_Justice-1",
        "AzudemK-1",
        "Positivevibes845-1",
        "Semyonov-1", // 1440p
        "slamdunk_12-1",
        // "ur4ddiction-1", // Not 1080p; 1022x598
        "Enzo03-1",
    ],
    "summer": [
    ],
    "autumn": [
        "SkylineSonata-1",
    ],
};
