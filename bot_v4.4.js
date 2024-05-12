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

const BOT_LINK = "https://t.me/clash_of_clans_lookup_bot";

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

    console.log("🚀 ~ bot.on ~ data:", data);

    // Store the response data in the session object
    sessions.response = data;

    // Format the data to only include the first 20 entries
    const slicedData = JSON.stringify(
      Object.fromEntries(Object.entries(data).slice(0, 19))
    );

    writeToCSV(
      `${session.searchType},${query},${slicedData}`,
      "bot_requests.csv"
    );
    let message = "";

    // Format data based on search type
    if (session.searchType === "player") {
      // Add Hero Levels
      let heroLevels = "";
      const heroes = data.heroes;

      if (heroes && heroes.length > 0) {
        heroLevels = heroes
          .map((hero) => {
            if (hero.village === "home") {
              let emoji = "";
              if (hero.level === hero.maxLevel) {
                emoji = "🔥";
              }
              const initials = hero.name
                .split(" ")
                .map((part) => part[0].toUpperCase())
                .join("");
              return `${initials} ${emoji}${hero.level}`;
            }
          })
          .join(" | ");
      }

      // Format player data
      message = `🙋‍♂️Player Name: ${data.name}\n🏷️Player Tag: ${
        data.tag
      }\n*️⃣Experience Level: ${data.expLevel}\n🏰Town Hall Level: ${
        data.townHallLevel
      }\n🏹Town Hall Weapon Level: ${data.townHallWeaponLevel}\n🏆Trophies: ${
        data.trophies
      }\n🎖️Best Trophies: ${data.bestTrophies}\n⭐War Stars: ${
        data.warStars
      }\n⚔️Attack Wins: ${data.attackWins}\n🛡️Defense Wins: ${
        data.defenseWins
      }\n🛖Builder Hall Level: ${data.builderHallLevel}\n🎪Clan Name: ${
        data.hasOwnProperty("clan") ? data.clan.name : "No Clan"
      }\n🔖Clan Tag: ${
        data.hasOwnProperty("clan") ? data.clan.tag : "No Clan"
      }\n📶Clan Level: ${
        data.hasOwnProperty("clan") ? data.clan.clanLevel : "No Clan"
      }\nClan Role: ${
        data.hasOwnProperty("role") ? data.role : "No Clan"
      }\nWar Preference: ${
        data.hasOwnProperty("warPreference")
          ? data.warPreference
          : "Not available"
      }\nClan Capital Contributions: ${
        data.clanCapitalContributions
      }\n👑Heroes: ${heroLevels}`;
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

    // Buttons for more detailed information
    const detailedInfoButtons1 = [
      { text: "Pets", callback_data: "pets" },
      { text: "Heroes Equipments", callback_data: "equipments" },
      { text: "Spells", callback_data: "spells" },
    ];

    // Send message with button to the user
    if (session.searchType === "player") {
      ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [[lookupButton], detailedInfoButtons1],
        },
      });
    } else {
      ctx.reply(message, {
        reply_markup: { inline_keyboard: [[lookupButton]] },
      });
    }

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

// Handle button clicks
bot.action("pets", async (ctx) => {
  try {
    const { troops } = sessions.response;

    const firstPetIndex = troops.findIndex(
      (troop) => troop.name === "L.A.S.S.I"
    );
    const pets = troops.slice(firstPetIndex);

    // Craft message for pets
    let petsMessage = `${sessions.response.tag} 🐾Pets:\n`;
    pets.forEach((pet, index) => {
      let levelString = `${pet.level}`;
      if (pet.level === pet.maxLevel) {
        levelString = `🔥${levelString}`;
      }
      petsMessage += `\n${index + 1}. ${pet.name}: ${levelString}`;
    });

    // Append the bot link to the message
    const messageWithLink = `${petsMessage}\n\nSearch for more info: [Clash bot](${BOT_LINK})`;

    // Send the troops levels information to the user
    ctx.replyWithMarkdown(messageWithLink);
  } catch (error) {
    console.error("Error handling troops action:", error);
    ctx.reply("An error occurred while handling troops action.");
  }
});

bot.action("spells", async (ctx) => {
  try {
    const { spells } = sessions.response;
    // Extract spells levels information from the response data
    let spellsMessage = `${sessions.response.tag} 🧪Spells:\n`;
    spells.forEach((spell, index) => {
      let levelString = `${spell.level}`;
      if (spell.level === spell.maxLevel) {
        levelString = `🔥${levelString}`;
      }
      spellsMessage += `\n${index + 1}. ${spell.name}: ${levelString}`;
    });

    // Append the bot link to the message
    const messageWithLink = `${spellsMessage}\n\nSearch for more info: [Clash bot](${BOT_LINK})`;

    // Send the troops levels information to the user
    ctx.replyWithMarkdown(messageWithLink);
  } catch (error) {
    console.error("Error handling spells action:", error);
    ctx.reply("An error occurred while handling spells action.");
  }
});

bot.action("equipments", async (ctx) => {
  try {
    const { heroEquipment } = sessions.response;
    // Extract heroes levels information from the response data
    let heroEquipmentMessage = `${sessions.response.tag} ❄️Equipments:\n`;
    heroEquipment.forEach((equipment, index) => {
      let levelString = `${equipment.level}`;
      if (equipment.level === equipment.maxLevel) {
        levelString = `🔥${levelString}`;
      }
      heroEquipmentMessage += `\n${index + 1}. ${
        equipment.name
      }: ${levelString}`;
    });

    // Append the bot link to the message
    const messageWithLink = `${heroEquipmentMessage}\n\nSearch for more info: [Clash bot](${BOT_LINK})`;

    // Send the troops levels information to the user
    ctx.replyWithMarkdown(messageWithLink);
  } catch (error) {
    console.error("Error handling heroes action:", error);
    ctx.reply("An error occurred while handling heroes action.");
  }
});

// Function to write data to CSV file
function writeToCSV(data, fileName) {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  const rows = data.split("\n").slice(0, 8); // Split data into rows and select the first 8 rows
  const formattedRows = rows.join("\n"); // Join the selected rows back into a single string
  const row = `${timestamp},${formattedRows}\n`;

  fs.appendFile(fileName, row, { encoding: "utf-8" }, (err) => {
    if (err) {
      console.error("Error writing to CSV file:", err);
    }
  });
}
console.log(sessions);
console.log("Bot is running...");

// Start listening to Telegram updates
bot.launch();
