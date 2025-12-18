// Sử dụng Google Apps Script Web App URL
const WEB_APP_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL || ''

// Interface cho Player
interface Player {
  id: string
  name: string
  position: string
  skillPoints: number
  image?: string
  createdAt: number
}

// Interface cho Match
interface Match {
  id: string
  team1: string
  team2: string
  score1: number
  score2: number
  date: string
  team1Players?: Player[]
  team2Players?: Player[]
  createdAt: number
}

// Gọi Google Apps Script để lấy dữ liệu
const callGoogleScript = async (action: string, data?: any) => {
  try {
    if (!WEB_APP_URL) {
      const errorMsg = 'WEB_APP_URL is not defined! Please check your .env.local file.'
      console.error(errorMsg)
      throw new Error(errorMsg)
    }

    const requestBody = {
      action,
      data
    }

    console.log('Calling Google Script:', { 
      action, 
      url: WEB_APP_URL.substring(0, 50) + '...', 
      hasData: !!data 
    })

    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      // Google Apps Script handles CORS automatically
      mode: 'cors',
      cache: 'no-cache'
    })

    console.log('Response status:', response.status, response.statusText)

    if (!response.ok) {
      let errorText = ''
      let errorJson = null
      try {
        errorText = await response.text()
        // Try to parse as JSON
        try {
          errorJson = JSON.parse(errorText)
        } catch (e) {
          // Not JSON, use as text
        }
      } catch (e) {
        errorText = 'Could not read error response'
      }
      
      const errorMessage = errorJson?.error || errorText || `HTTP ${response.status}`
      console.error('HTTP error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        action,
        url: WEB_APP_URL.substring(0, 50) + '...'
      })
      throw new Error(`HTTP ${response.status}: ${errorMessage}`)
    }

    let result
    try {
      const text = await response.text()
      console.log('Response text:', text.substring(0, 200))
      result = JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      throw new Error('Invalid JSON response from Google Script')
    }

    console.log('Google Script response:', result)
    
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from Google Script')
    }

    return result
  } catch (error: any) {
    console.error('Error calling Google Script:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      action,
      url: WEB_APP_URL ? WEB_APP_URL.substring(0, 50) + '...' : 'undefined'
    })
    throw error
  }
}

// Lấy danh sách cầu thủ từ Google Sheets
export const getPlayersFromSheets = async (): Promise<Player[]> => {
  try {
    const result = await callGoogleScript('getPlayers')
    console.log('getPlayers result:', result)
    return result.success ? result.data || [] : []
  } catch (error) {
    console.error('Error fetching players from sheets:', error)
    return []
  }
}

// Lưu cầu thủ vào Google Sheets
export const savePlayerToSheets = async (player: Player): Promise<Player | null> => {
  try {
    console.log('savePlayerToSheets called with:', player)
    const result = await callGoogleScript('savePlayer', player)
    console.log('savePlayer result:', result)
    
    if (result && result.success) {
      if (result.player) {
        return result.player as Player
      }
      // In case Apps Script didn't return the player object, fall back to original payload
      return player
    } else {
      console.error('savePlayer returned failure:', result)
      return null
    }
  } catch (error: any) {
    console.error('Error saving player to sheets:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return null
  }
}

// Cập nhật cầu thủ trong Google Sheets
export const updatePlayerInSheets = async (player: Player): Promise<Player | { error: string, searchedIds?: string[] }> => {
  try {
    console.log('updatePlayerInSheets called with:', { id: player.id, name: player.name, skillPoints: player.skillPoints })
    const result = await callGoogleScript('updatePlayer', player)
    console.log('updatePlayer result:', result)
    
    if (result && result.success) {
      if (result.player) {
        return result.player as Player
      }
      return player
    } else {
      const errorMsg = result?.error || 'Unknown error from Google Script'
      console.error('updatePlayer returned failure:', errorMsg)
      console.error('Full result:', result)
      if (result?.searchedIds) {
        console.error('Searched IDs in sheet:', result.searchedIds)
      }
      return { 
        error: errorMsg,
        searchedIds: result?.searchedIds
      }
    }
  } catch (error: any) {
    console.error('Error updating player in sheets:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return { error: error?.message || 'Unknown error occurred' }
  }
}

// Xóa cầu thủ khỏi Google Sheets
export const deletePlayerFromSheets = async (playerId: string): Promise<boolean> => {
  try {
    const result = await callGoogleScript('deletePlayer', { id: playerId })
    console.log('deletePlayer result:', result)
    return result.success || false
  } catch (error) {
    console.error('Error deleting player from sheets:', error)
    return false
  }
}

// Lấy danh sách trận đấu từ Google Sheets
export const getMatchesFromSheets = async (): Promise<Match[]> => {
  try {
    const result = await callGoogleScript('getMatches')
    console.log('getMatches result:', result)
    return result.success ? result.data || [] : []
  } catch (error) {
    console.error('Error fetching matches from sheets:', error)
    return []
  }
}

// Lưu trận đấu vào Google Sheets
export const saveMatchToSheets = async (match: Match): Promise<boolean> => {
  try {
    const result = await callGoogleScript('saveMatch', match)
    console.log('saveMatch result:', result)
    return result.success || false
  } catch (error) {
    console.error('Error saving match to sheets:', error)
    return false
  }
}

// Cập nhật trận đấu trong Google Sheets
export const updateMatchInSheets = async (match: Match): Promise<boolean | { error: string, searchedIds?: string[] }> => {
  try {
    console.log('updateMatchInSheets called with:', { id: match.id, team1: match.team1, team2: match.team2, score1: match.score1, score2: match.score2 })
    const result = await callGoogleScript('updateMatch', match)
    console.log('updateMatch result:', result)
    
    if (result && result.success) {
      return true
    } else {
      const errorMsg = result?.error || 'Unknown error from Google Script'
      console.error('updateMatch returned failure:', errorMsg)
      console.error('Full result:', result)
      if (result?.searchedIds) {
        console.error('Searched IDs in sheet:', result.searchedIds)
      }
      return { 
        error: errorMsg,
        searchedIds: result?.searchedIds
      }
    }
  } catch (error: any) {
    console.error('Error updating match in sheets:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return { error: error?.message || 'Unknown error occurred' }
  }
}

// Xóa trận đấu khỏi Google Sheets
export const deleteMatchFromSheets = async (matchId: string): Promise<boolean> => {
  try {
    const result = await callGoogleScript('deleteMatch', { id: matchId })
    console.log('deleteMatch result:', result)
    return result.success || false
  } catch (error) {
    console.error('Error deleting match from sheets:', error)
    return false
  }
}

// Lấy danh sách đội từ Google Sheets
export const getTeamsFromSheets = async (): Promise<any[]> => {
  try {
    const result = await callGoogleScript('getTeams')
    console.log('getTeams result:', result)
    return result.success ? result.data || [] : []
  } catch (error) {
    console.error('Error fetching teams from sheets:', error)
    return []
  }
}

// Lưu đội vào Google Sheets (từ team-balancer)
export const saveTeamsToSheets = async (teams: any[]): Promise<boolean> => {
  try {
    const result = await callGoogleScript('saveTeams', teams)
    console.log('saveTeams result:', result)
    return result.success || false
  } catch (error) {
    console.error('Error saving teams to sheets:', error)
    return false
  }
}
