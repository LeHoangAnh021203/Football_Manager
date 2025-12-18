// Google Apps Script cho Football Manager
// Paste code này vào Google Apps Script Editor
const IMAGE_FOLDER_NAME = "FootballManagerPlayerImages";
const IMAGE_FILE_PREFIX = "player-image-";

function getOrCreateImageFolder() {
  const folders = DriveApp.getFoldersByName(IMAGE_FOLDER_NAME);
  if (folders.hasNext()) {
    const folder = folders.next();
    folder.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );
    return folder;
  }
  const folder = DriveApp.createFolder(IMAGE_FOLDER_NAME);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function createPublicImageFromDataUrl(imageData, playerId) {
  try {
    if (!imageData || typeof imageData !== "string") {
      return { success: true, url: "" };
    }

    if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      return { success: true, url: imageData };
    }

    const matches = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return { success: false, error: "Invalid Data URL format" };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const extension =
      mimeType.indexOf("png") !== -1
        ? "png"
        : mimeType.indexOf("gif") !== -1
        ? "gif"
        : "jpg";

    const folder = getOrCreateImageFolder();
    const fileName = `${IMAGE_FILE_PREFIX}${
      playerId || Date.now()
    }-${Date.now()}.${extension}`;
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      fileName
    );
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const publicUrl = `https://drive.google.com/uc?export=view&id=${file.getId()}`;

    return { success: true, url: publicUrl };
  } catch (error) {
    return {
      success: false,
      error: "Failed to process image: " + error.toString(),
    };
  }
}

function normalizeImageValue(imageValue, playerId, sheet, rowIndex) {
  if (
    !imageValue ||
    typeof imageValue !== "string" ||
    !imageValue.startsWith("data:")
  ) {
    return imageValue ? String(imageValue) : "";
  }

  const imageResult = createPublicImageFromDataUrl(imageValue, playerId);
  if (imageResult.success) {
    if (sheet && rowIndex) {
      try {
        sheet.getRange(rowIndex, 5).setValue(imageResult.url);
      } catch (error) {
        console.error("Failed to update image URL in sheet:", error);
      }
    }
    return imageResult.url;
  }

  console.error(
    "Failed to convert stored image data for player",
    playerId,
    imageResult.error
  );
  return imageValue;
}
function doGet(e) {
  try {
    // If no parameters, return test connection
    if (!e || !e.parameter || !e.parameter.action) {
      return ContentService.createTextOutput(
        JSON.stringify(testConnection())
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action;
    let data = null;

    try {
      data = e.parameter.data ? JSON.parse(e.parameter.data) : null;
    } catch (parseError) {
      // Ignore parse errors for data parameter
    }

    let result = {};

    switch (action) {
      case "getPlayers":
        result = getPlayers();
        break;
      case "getMatches":
        result = getMatches();
        break;
      case "getTeams":
        result = getTeams();
        break;
      case "testConnection":
        result = testConnection();
        break;
      default:
        result = {
          success: false,
          error: "Invalid action for GET request: " + action,
        };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Check if postData exists
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "No post data provided",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Parse request data
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in post data: " + parseError.toString(),
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const action = requestData.action;
    const data = requestData.data;

    if (!action) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Action is required",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    let result = {};

    switch (action) {
      case "getPlayers":
        result = getPlayers();
        break;
      case "savePlayer":
        if (!data) {
          result = { success: false, error: "Player data is required" };
        } else {
          result = savePlayer(data);
        }
        break;
      case "updatePlayer":
        if (!data) {
          result = { success: false, error: "Player data is required" };
        } else {
          result = updatePlayer(data);
        }
        break;
      case "deletePlayer":
        if (!data || !data.id) {
          result = { success: false, error: "Player ID is required" };
        } else {
          result = deletePlayer(data.id);
        }
        break;
      case "getMatches":
        result = getMatches();
        break;
      case "saveMatch":
        if (!data) {
          result = { success: false, error: "Match data is required" };
        } else {
          result = saveMatch(data);
        }
        break;
      case "updateMatch":
        if (!data) {
          result = { success: false, error: "Match data is required" };
        } else {
          result = updateMatch(data);
        }
        break;
      case "deleteMatch":
        if (!data || !data.id) {
          result = { success: false, error: "Match ID is required" };
        } else {
          result = deleteMatch(data.id);
        }
        break;
      case "saveTeams":
        if (!data) {
          result = { success: false, error: "Teams data is required" };
        } else {
          result = saveTeams(data);
        }
        break;
      case "getTeams":
        result = getTeams();
        break;
      default:
        result = { success: false, error: "Unknown action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== PLAYERS FUNCTIONS ==========

function getPlayers() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    const sheet = spreadsheet.getSheetByName("Players");
    if (!sheet) {
      // Sheet doesn't exist, return empty array
      return { success: true, data: [] };
    }

    const data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const players = [];

    // Start from row 1 (skip header row 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row && row[0]) {
        // Check if ID exists
        // Clamp skillPoints between 1 and 10
        const rawSkillPoints = parseInt(row[3]) || 5;
        const clampedSkillPoints = Math.max(1, Math.min(10, rawSkillPoints));

        const normalizedImage = normalizeImageValue(
          row[4],
          row[0],
          sheet,
          i + 1
        );

        players.push({
          id: String(row[0]),
          name: String(row[1] || ""),
          position: String(row[2] || ""),
          skillPoints: clampedSkillPoints,
          image: String(normalizedImage || ""),
          createdAt: parseInt(row[5]) || Date.now(),
        });
      }
    }

    return { success: true, data: players };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function savePlayer(player) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    let sheet = spreadsheet.getSheetByName("Players");
    if (!sheet) {
      // Create Players sheet if it doesn't exist
      sheet = spreadsheet.insertSheet("Players");
      sheet
        .getRange(1, 1, 1, 6)
        .setValues([
          ["ID", "Name", "Position", "SkillPoints", "Image", "CreatedAt"],
        ]);
    }

    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet
        .getRange(1, 1, 1, 6)
        .setValues([
          ["ID", "Name", "Position", "SkillPoints", "Image", "CreatedAt"],
        ]);
    }

    // Validate player data
    if (!player || !player.id || !player.name) {
      return { success: false, error: "Player ID and name are required" };
    }

    // Clamp skillPoints between 1 and 10
    const rawSkillPoints = parseInt(player.skillPoints) || 5;
    const clampedSkillPoints = Math.max(1, Math.min(10, rawSkillPoints));

    const imageResult = createPublicImageFromDataUrl(player.image, player.id);
    if (!imageResult.success) {
      return { success: false, error: imageResult.error };
    }

    const createdAt = parseInt(player.createdAt) || Date.now();
    const storedPlayer = {
      id: String(player.id),
      name: String(player.name),
      position: String(player.position || ""),
      skillPoints: clampedSkillPoints,
      image: String(imageResult.url || ""),
      createdAt,
    };

    // Add new player
    sheet.appendRow([
      storedPlayer.id,
      storedPlayer.name,
      storedPlayer.position,
      storedPlayer.skillPoints,
      storedPlayer.image,
      storedPlayer.createdAt,
    ]);

    return { success: true, player: storedPlayer };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updatePlayer(player) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    const sheet = spreadsheet.getSheetByName("Players");
    if (!sheet) {
      return { success: false, error: "Players sheet not found" };
    }

    // Validate player data
    if (!player || !player.id) {
      return { success: false, error: "Player ID is required" };
    }

    // Convert player.id to string for comparison
    const playerIdStr = String(player.id);

    const data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      return { success: false, error: "No players found in sheet" };
    }

    let found = false;
    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][0] || "");
      if (rowId === playerIdStr) {
        found = true;
        // Clamp skillPoints between 1 and 10
        const rawSkillPoints = parseInt(player.skillPoints) || 5;
        const clampedSkillPoints = Math.max(1, Math.min(10, rawSkillPoints));
        let imageValue = "";

        if (typeof player.image === "string") {
          if (player.image) {
            const imageResult = createPublicImageFromDataUrl(
              player.image,
              player.id
            );
            if (!imageResult.success) {
              return { success: false, error: imageResult.error };
            }
            imageValue = String(imageResult.url || "");
          } else {
            imageValue = "";
          }
        } else {
          imageValue = String(data[i][4] || "");
        }

        // Update the row
        const createdAtValue =
          parseInt(player.createdAt) || parseInt(data[i][5]) || Date.now();
        const updatedPlayer = {
          id: String(player.id || ""),
          name: String(player.name || ""),
          position: String(player.position || ""),
          skillPoints: clampedSkillPoints,
          image: imageValue,
          createdAt: createdAtValue,
        };

        try {
          sheet
            .getRange(i + 1, 1, 1, 6)
            .setValues([
              [
                updatedPlayer.id,
                updatedPlayer.name,
                updatedPlayer.position,
                updatedPlayer.skillPoints,
                updatedPlayer.image,
                updatedPlayer.createdAt,
              ],
            ]);
          return {
            success: true,
            message: "Player updated successfully",
            player: updatedPlayer,
          };
        } catch (updateError) {
          return {
            success: false,
            error: "Failed to update row: " + updateError.toString(),
          };
        }
      }
    }

    if (!found) {
      return {
        success: false,
        error: "Player not found with ID: " + playerIdStr,
        searchedIds: data
          .slice(1)
          .map((row) => String(row[0] || ""))
          .slice(0, 5), // First 5 IDs for debugging
      };
    }

    return { success: false, error: "Unexpected error" };
  } catch (error) {
    return { success: false, error: error.toString(), stack: error.stack };
  }
}

function deletePlayer(playerId) {
  try {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Players");
    if (!sheet) {
      return { success: false, error: "Players sheet not found" };
    }

    const data = sheet.getDataRange().getValues();
    const targetId = String(playerId || "");
    if (!targetId) {
      return { success: false, error: "Player ID is required" };
    }

    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][0] || "");
      if (rowId === targetId) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }

    return { success: false, error: "Player not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ========== MATCHES FUNCTIONS ==========

function getMatches() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    const sheet = spreadsheet.getSheetByName("Matches");
    if (!sheet) {
      // Sheet doesn't exist, return empty array
      return { success: true, data: [] };
    }

    const data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const matches = [];

    // Start from row 1 (skip header row 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row && row[0]) {
        // Check if ID exists
        try {
          matches.push({
            id: String(row[0]),
            team1: String(row[1] || ""),
            team2: String(row[2] || ""),
            score1: parseInt(row[3]) || 0,
            score2: parseInt(row[4]) || 0,
            date: String(row[5] || ""),
            team1Players: row[6] ? JSON.parse(row[6]) : undefined,
            team2Players: row[7] ? JSON.parse(row[7]) : undefined,
            createdAt: parseInt(row[8]) || Date.now(),
          });
        } catch (parseError) {
          console.error("Error parsing match data:", parseError);
        }
      }
    }

    return { success: true, data: matches };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function saveMatch(match) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    let sheet = spreadsheet.getSheetByName("Matches");
    if (!sheet) {
      // Create Matches sheet if it doesn't exist
      sheet = spreadsheet.insertSheet("Matches");
      sheet
        .getRange(1, 1, 1, 9)
        .setValues([
          [
            "ID",
            "Team1",
            "Team2",
            "Score1",
            "Score2",
            "Date",
            "Team1Players",
            "Team2Players",
            "CreatedAt",
          ],
        ]);
    }

    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet
        .getRange(1, 1, 1, 9)
        .setValues([
          [
            "ID",
            "Team1",
            "Team2",
            "Score1",
            "Score2",
            "Date",
            "Team1Players",
            "Team2Players",
            "CreatedAt",
          ],
        ]);
    }

    // Validate match data
    if (!match || !match.id) {
      return { success: false, error: "Match ID is required" };
    }

    // Add new match
    sheet.appendRow([
      match.id,
      match.team1 || "",
      match.team2 || "",
      parseInt(match.score1) || 0,
      parseInt(match.score2) || 0,
      match.date || "",
      match.team1Players ? JSON.stringify(match.team1Players) : "",
      match.team2Players ? JSON.stringify(match.team2Players) : "",
      parseInt(match.createdAt) || Date.now(),
    ]);

    // Ensure ID column stays as plain text to avoid scientific notation
    const lastRow = sheet.getLastRow();
    setCellAsText(sheet, lastRow, 1, match.id || "");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updateMatch(match) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    const sheet = spreadsheet.getSheetByName("Matches");
    if (!sheet) {
      return { success: false, error: "Matches sheet not found" };
    }

    // Validate match data
    if (!match || !match.id) {
      return { success: false, error: "Match ID is required" };
    }

    // Convert match.id to string for comparison
    const matchIdStr = String(match.id);

    const data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      return { success: false, error: "No matches found in sheet" };
    }

    let found = false;
    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][0] || "");
      if (rowId === matchIdStr) {
        found = true;
        // Update the row
        try {
          sheet
            .getRange(i + 1, 1, 1, 9)
            .setValues([
              [
                String(match.id || ""),
                String(match.team1 || ""),
                String(match.team2 || ""),
                parseInt(match.score1) || 0,
                parseInt(match.score2) || 0,
                String(match.date || ""),
                match.team1Players ? JSON.stringify(match.team1Players) : "",
                match.team2Players ? JSON.stringify(match.team2Players) : "",
                parseInt(match.createdAt) || Date.now(),
              ],
            ]);
          setCellAsText(sheet, i + 1, 1, match.id || "");
          return { success: true, message: "Match updated successfully" };
        } catch (updateError) {
          return {
            success: false,
            error: "Failed to update row: " + updateError.toString(),
          };
        }
      }
    }

    if (!found) {
      return {
        success: false,
        error: "Match not found with ID: " + matchIdStr,
        searchedIds: data
          .slice(1)
          .map((row) => String(row[0] || ""))
          .slice(0, 5), // First 5 IDs for debugging
      };
    }

    return { success: false, error: "Unexpected error" };
  } catch (error) {
    return { success: false, error: error.toString(), stack: error.stack };
  }
}

function deleteMatch(matchId) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    const sheet = spreadsheet.getSheetByName("Matches");
    if (!sheet) {
      return { success: false, error: "Matches sheet not found" };
    }

    const normalizedId = String(matchId || "").trim();
    if (!normalizedId) {
      return { success: false, error: "Match ID is required" };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][0] || "").trim();
      if (rowId === normalizedId) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }

    return {
      success: false,
      error: "Match not found with ID: " + normalizedId,
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ========== TEAMS FUNCTIONS ==========

function getTeams() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Teams");
    if (!sheet) {
      return { success: true, data: [] };
    }

    const data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const teams = [];

    // Start from row 1 (skip header row 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row && row[0]) {
        // Check if TeamName exists
        try {
          teams.push({
            name: String(row[0] || ""),
            players: row[1] ? JSON.parse(row[1]) : [],
            totalPoints: parseInt(row[2]) || 0,
            createdAt: parseInt(row[3]) || Date.now(),
          });
        } catch (parseError) {
          console.error("Error parsing team data:", parseError);
        }
      }
    }

    return { success: true, data: teams };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function saveTeams(teams) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: "No active spreadsheet found" };
    }

    let sheet = spreadsheet.getSheetByName("Teams");
    if (!sheet) {
      // Create Teams sheet if it doesn't exist
      sheet = spreadsheet.insertSheet("Teams");
      sheet
        .getRange(1, 1, 1, 4)
        .setValues([["TeamName", "Players", "TotalPoints", "CreatedAt"]]);
    }

    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet
        .getRange(1, 1, 1, 4)
        .setValues([["TeamName", "Players", "TotalPoints", "CreatedAt"]]);
    }

    // Clear existing data (except header)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }

    // Add teams data
    teams.forEach((team) => {
      sheet.appendRow([
        team.name,
        JSON.stringify(team.players),
        team.totalPoints,
        Date.now(),
      ]);
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function setCellAsText(sheet, row, col, value) {
  try {
    const range = sheet.getRange(row, col);
    range.setNumberFormat("@");
    range.setValue(String(value || ""));
  } catch (error) {
    console.error("Failed to set cell as text:", error);
  }
}

// ========== UTILITY FUNCTIONS ==========

function testConnection() {
  return {
    success: true,
    message: "Google Apps Script is working!",
    timestamp: new Date().toISOString(),
  };
}

function setupSheets() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Create Players sheet if it doesn't exist
    let playersSheet = spreadsheet.getSheetByName("Players");
    if (!playersSheet) {
      playersSheet = spreadsheet.insertSheet("Players");
      playersSheet
        .getRange(1, 1, 1, 6)
        .setValues([
          ["ID", "Name", "Position", "SkillPoints", "Image", "CreatedAt"],
        ]);
    }

    // Create Matches sheet if it doesn't exist
    let matchesSheet = spreadsheet.getSheetByName("Matches");
    if (!matchesSheet) {
      matchesSheet = spreadsheet.insertSheet("Matches");
      matchesSheet
        .getRange(1, 1, 1, 9)
        .setValues([
          [
            "ID",
            "Team1",
            "Team2",
            "Score1",
            "Score2",
            "Date",
            "Team1Players",
            "Team2Players",
            "CreatedAt",
          ],
        ]);
    }

    // Create Teams sheet if it doesn't exist
    let teamsSheet = spreadsheet.getSheetByName("Teams");
    if (!teamsSheet) {
      teamsSheet = spreadsheet.insertSheet("Teams");
      teamsSheet
        .getRange(1, 1, 1, 4)
        .setValues([["TeamName", "Players", "TotalPoints", "CreatedAt"]]);
    }

    return {
      success: true,
      message: "Sheets setup completed successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
}
