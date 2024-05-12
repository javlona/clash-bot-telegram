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

    const { data } = response;

    const slicedData = JSON.stringify(
      Object.fromEntries(Object.entries(data).slice(0, 19))
    );

    //console.log("🚀 ~ sliced data:", data);
    //const data = JSON.stringify(data);
    writeToCSV(`${session.searchType},${query},${slicedData}`);
    let message = "";

    // Format data based on search type
    if (session.searchType === "player") {
      // Add Hero Levels
      let heroLevels = "";
      const heroes = data.heroes;

      console.log("troops", data.heroes);

      if (heroes && heroes.length > 0) {
        heroLevels = heroes
          .map((hero) => {
            let emoji = "";
            if (hero.level === hero.maxLevel) {
              emoji = "🔥";
            }
            const initials = hero.name
              .split(" ")
              .map((part) => part[0].toUpperCase())
              .join("");
            return `${initials} ${emoji}${hero.level}`;
          })
          .join(" | ");
        // message += `\n👑Hero Levels: ${heroLevels}`;
      }

      console.log(heroLevels);

      // Format player data
      message = `🙋‍♂️Player Name: ${data.name}\n🏷️Player Tag: ${data.tag}\n*️⃣Experience Level: ${data.expLevel}\n🏰Town Hall Level: ${data.townHallLevel}\n🏹Town Hall Weapon Level: ${data.townHallWeaponLevel}\n🏆Trophies: ${data.trophies}\n🎖️Best Trophies: ${data.bestTrophies}\n⭐War Stars: ${data.warStars}\n⚔️Attack Wins: ${data.attackWins}\n🛡️Defense Wins: ${data.defenseWins}\n🛖Builder Hall Level: ${data.builderHallLevel}\n🎪Clan Name: ${data.clan.name}\n🔖Clan Tag: ${data.clan.tag}\n📶Clan Level: ${data.clan.clanLevel}\nClan Role: ${data.role}\nWar Preference: ${data.warPreference}\nClan Capital Contributions: ${data.clanCapitalContributions}\n👑Heroes: ${heroLevels}`;
    } else if (session.searchType === "clan") {
      // Format clan data
      message = `Clan Name 🎪: ${data.name}\nClan Tag 🏷️: ${data.tag}\nClan Level 📶: ${data.clanLevel}\nBadge URL: ${data.badgeUrls.large}\nClan type: ${data.type}\nRequired trophies 🏆: ${data.requiredTrophies}\nClan location 🌎: ${data.location.name}\nChat language 🌐: ${data.chatLanguage.name}\nClan war wins: ${data.warWins}\nClan war win streak: ${data.warWinStreak}\nClan war league: ${data.warLeague.name}\nClan war frequency: ${data.warFrequency}\nClan members count: ${data.members}\nClan Capital Hall level 🏘️: ${data.clanCapital.capitalHallLevel}`;
    }

    const tagWithoutPound = data.tag.replace("#", "");
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
      error.response ? error.data : error.message
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
