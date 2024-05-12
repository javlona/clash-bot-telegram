// Import required libraries
const { Telegraf } = require("telegraf");
const axios = require("axios");
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

    const data = response.data;
    let message = "";

    // Format data based on search type
    if (session.searchType === "player") {
      // Format player data
      message = `Player Name: ${data.name}\nPlayer Tag: ${data.tag}\nTown Hall Level: ${data.townHallLevel}\nTown Hall Weapon Level: ${data.townHallWeaponLevel}\nExperience Level: ${data.expLevel}\nTrophies: ${data.trophies}\nBest Trophies: ${data.bestTrophies}\nWar Stars: ${data.warStars}\nAttack Wins: ${data.attackWins}\nDefense Wins: ${data.defenseWins}\nBuilder Hall Level: ${data.builderHallLevel}\nBuilder Base Trophies: ${data.builderBaseTrophies}\nBest Builder Base Trophies: ${data.bestBuilderBaseTrophies}\nRole: ${data.role}\nWar Preference: ${data.warPreference}\nDonations: ${data.donations}\nDonations Received: ${data.donationsReceived}\nClan Capital Contributions: ${data.clanCapitalContributions}`;
    } else if (session.searchType === "clan") {
      // Format clan data
      message = `Clan Name: ${data.name}\nClan Tag: ${data.tag}\nClan Level: ${data.clanLevel}`;
    }

    // Send formatted message to the user
    ctx.reply(message);

    // Clear session after successful search
    delete sessions[ctx.from.id];
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
    ctx.reply("An error occurred while fetching data. Please try again later.");
  }
});

console.log("Bot is running...");
// Start listening to Telegram updates
bot.launch();
