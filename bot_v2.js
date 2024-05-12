// Import required libraries
const { Telegraf } = require("telegraf");
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
require("dotenv").config();

// Initialize Telegraf bot with your Telegram Bot token
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Object to store session data
const sessions = {};

// Define inline keyboard markup
const keyboardMarkup = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Search Player", callback_data: "searchPlayer" }],
      [{ text: "Search Clan", callback_data: "searchClan" }],
    ],
  },
};

// Start command handler
bot.command("start", (ctx) => {
  // Set default search type as player
  sessions[ctx.from.id] = { searchType: "player" };
  ctx.reply(
    "Welcome to the Clash of Clans bot! Use the buttons below to search for players or clans.",
    keyboardMarkup
  );
});

// Handler for inline keyboard buttons
bot.action("searchPlayer", (ctx) => {
  sessions[ctx.from.id] = { searchType: "player" };
  ctx.reply("Please enter the player tag:");
});

bot.action("searchClan", (ctx) => {
  sessions[ctx.from.id] = { searchType: "clan" };
  ctx.reply("Please enter the clan tag:");
});

// Handler for receiving user input after selecting a search type
bot.on("text", async (ctx) => {
  const session = sessions[ctx.from.id];
  if (!session || !session.searchType) {
    return ctx.reply("Please select a search type first.");
  }

  const query = ctx.message.text;
  let url = "";

  if (session.searchType === "player") {
    url = `https://api.clashofclans.com/v1/players/${encodeURIComponent(
      query
    )}`;
  } else if (session.searchType === "clan") {
    url = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(query)}`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.COC_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    const data = JSON.stringify(response.data);
    writeToCSV(`${session.searchType},${query},${data}`);
    let message = "";

    // Format data based on search type
    if (session.searchType === "player") {
      // Format player data
      message = `Player Name: ${response.data.name}\nPlayer Tag: ${response.data.tag}\nTown Hall Level: ${response.data.townHallLevel}\nTown Hall Weapon Level: ${response.data.townHallWeaponLevel}\nExperience Level: ${response.data.expLevel}\nTrophies: ${response.data.trophies}\nBest Trophies: ${response.data.bestTrophies}\nWar Stars: ${response.data.warStars}\nAttack Wins: ${response.data.attackWins}\nDefense Wins: ${response.data.defenseWins}\nBuilder Hall Level: ${response.data.builderHallLevel}\nBuilder Base Trophies: ${response.data.builderBaseTrophies}\nBest Builder Base Trophies: ${response.data.bestBuilderBaseTrophies}\nRole: ${response.data.role}\nWar Preference: ${response.data.warPreference}\nDonations: ${response.data.donations}\nDonations Received: ${response.data.donationsReceived}\nClan Capital Contributions: ${response.data.clanCapitalContributions}`;
    } else if (session.searchType === "clan") {
      // Format clan data
      message = `Clan Name: ${response.data.name}\nClan Tag: ${response.data.tag}\nClan Level: ${response.data.clanLevel}`;
    }

    // Send formatted message to the user
    ctx.reply(message);

    // Clear session after successful search and reset search type to player
    sessions[ctx.from.id] = { searchType: "player" };
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
    ctx.reply(
      `An error occurred while fetching data. ${
        error.response ? JSON.stringify(error.response.data) : error.message
      }`
    );
  }
});

// Function to write data to CSV file
function writeToCSV(data) {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const row = `${timestamp},${data}\n`;

  fs.appendFile("bot_requests.csv", row, { encoding: "utf-8" }, (err) => {
    if (err) {
      console.error("Error writing to CSV file:", err);
    }
  });
}

console.log("Bot is running...");
// Start listening to Telegram updates
bot.launch();
