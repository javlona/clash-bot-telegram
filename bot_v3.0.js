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

// Command handler for /player
bot.command("player", (ctx) => {
  sessions[ctx.from.id] = { searchType: "player" };
  ctx.reply("Please enter the player tag:");
});

// Command handler for /clan
bot.command("clan", (ctx) => {
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

    const data = JSON.stringify(
      Object.fromEntries(Object.entries(response.data).slice(0, 19))
    );

    //console.log("🚀 ~ sliced data:", response.data);
    //const data = JSON.stringify(response.data);
    writeToCSV(`${session.searchType},${query},${data}`);
    let message = "";

    // Format data based on search type
    if (session.searchType === "player") {
      // Format player data
      message = `🙋‍♂️Player Name: ${response.data.name}\n🏷️Player Tag: ${response.data.tag}\n*️⃣Experience Level: ${response.data.expLevel}\n🏰Town Hall Level: ${response.data.townHallLevel}\n🏹Town Hall Weapon Level: ${response.data.townHallWeaponLevel}\n🏆Trophies: ${response.data.trophies}\n🎖️Best Trophies: ${response.data.bestTrophies}\n⭐War Stars: ${response.data.warStars}\n⚔️Attack Wins: ${response.data.attackWins}\n🛡️Defense Wins: ${response.data.defenseWins}\n🛖Builder Hall Level: ${response.data.builderHallLevel}\nBuilder Base Trophies: ${response.data.builderBaseTrophies}\nBest Builder Base Trophies: ${response.data.bestBuilderBaseTrophies}\n🎪Clan Name: ${response.data.clan.name}\n🔖Clan Tag: ${response.data.clan.tag}\n📶Clan Level: ${response.data.clan.clanLevel}\nRole: ${response.data.role}\nWar Preference: ${response.data.warPreference}\n🫴Donations: ${response.data.donations}\nDonations Received: ${response.data.donationsReceived}\nClan Capital Contributions: ${response.data.clanCapitalContributions}`;
    } else if (session.searchType === "clan") {
      // Format clan data
      message = `Clan Name 🎪: ${response.data.name}\nClan Tag 🏷️: ${response.data.tag}\nClan Level 📶: ${response.data.clanLevel}\nBadge URL: ${response.data.badgeUrls.large}\nClan type: ${response.data.type}\nRequired trophies 🏆: ${response.data.requiredTrophies}\nClan location 🌎: ${response.data.location.name}\nChat language 🌐: ${response.data.chatLanguage.name}\nClan war wins: ${response.data.warWins}\nClan war win streak: ${response.data.warWinStreak}\nClan war league: ${response.data.warLeague.name}\nClan war frequency: ${response.data.warFrequency}\nClan members count: ${response.data.members}\nClan Capital Hall level 🏘️: ${response.data.clanCapital.capitalHallLevel}`;
    }

    const tagWithoutPound = response.data.tag.replace("#", "");
    // Button for player or clan lookup
    let lookupButton;
    if (session.searchType === "player") {
      lookupButton = {
        text: "View Player Profile",
        url: `https://link.clashofclans.com/en?action=OpenPlayerProfile&tag=${tagWithoutPound}`, // Use query without URI encoding
      };
    } else if (session.searchType === "clan") {
      lookupButton = {
        text: "View Clan Profile",
        url: `https://link.clashofclans.com/en?action=OpenClanProfile&tag=${tagWithoutPound}`, // Use query without URI encoding
      };
    }

    // Send message with button to the user
    ctx.reply(message, { reply_markup: { inline_keyboard: [[lookupButton]] } });

    // // Send formatted message to the user
    // ctx.reply(message);

    // Clear session after successful search and reset search type to player
    sessions[ctx.from.id] = { searchType: "player" };
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
    ctx.reply(
      `An error occurred while fetching data. ${
        error.response && error.message
      }`
    );
  }
});

// Function to write data to CSV file
function writeToCSV(data) {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const rows = data.split("\n").slice(0, 8); // Split data into rows and select the first 8 rows
  const formattedRows = rows.join("\n"); // Join the selected rows back into a single string
  const row = `${timestamp},${formattedRows}\n`;

  fs.appendFile("bot_requests.csv", row, { encoding: "utf-8" }, (err) => {
    if (err) {
      console.error("Error writing to CSV file:", err);
    }
  });
}

console.log("Bot is running...");

// Start listening to Telegram updates
bot.launch();
