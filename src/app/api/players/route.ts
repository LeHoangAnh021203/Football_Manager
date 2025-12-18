import { NextRequest, NextResponse } from 'next/server'
import { getPlayersFromSheets, savePlayerToSheets, updatePlayerInSheets, deletePlayerFromSheets } from '@/lib/sheets'

export async function GET() {
  try {
    const players = await getPlayersFromSheets()
    return NextResponse.json(players)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/players called')
    const rawPlayer = await request.json()
    console.log('Player data received:', rawPlayer)
    
    // Validate player data
    if (!rawPlayer || !rawPlayer.id || !rawPlayer.name) {
      return NextResponse.json({ 
        error: 'Invalid player data. Player ID and name are required.' 
      }, { status: 400 })
    }

    // Ensure newly created players always have at least 5 skill points
    const parsedSkillPoints = Number(rawPlayer.skillPoints)
    const hasValidSkillPoints = Number.isFinite(parsedSkillPoints)
    const normalizedPlayer = {
      ...rawPlayer,
      skillPoints: hasValidSkillPoints ? parsedSkillPoints : 5,
    }
    
    const savedPlayer = await savePlayerToSheets(normalizedPlayer)
    console.log('Save result:', savedPlayer)
    
    if (savedPlayer) {
      return NextResponse.json({ message: 'Player saved successfully', player: savedPlayer })
    } else {
      return NextResponse.json({ error: 'Failed to save player to Google Sheets' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in POST /api/players:', error)
    return NextResponse.json({ 
      error: 'Failed to save player', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const player = await request.json()
    console.log('PUT /api/players called with player:', { id: player.id, name: player.name, skillPoints: player.skillPoints })
    
    // Validate player data
    if (!player || !player.id) {
      return NextResponse.json({ 
        error: 'Invalid player data. Player ID is required.' 
      }, { status: 400 })
    }
    
    const result = await updatePlayerInSheets(player)
    console.log('Update result:', result)
    
    if (!result || 'error' in result) {
      const errorMsg = result?.error || 'Failed to update player in Google Sheets'
      return NextResponse.json({ 
        error: errorMsg,
        details: result
      }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'Player updated successfully', player: result })
  } catch (error: any) {
    console.error('Error in PUT /api/players:', error)
    return NextResponse.json({ 
      error: 'Failed to update player',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('id')
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }
    
    const success = await deletePlayerFromSheets(playerId)
    
    if (success) {
      return NextResponse.json({ message: 'Player deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}
