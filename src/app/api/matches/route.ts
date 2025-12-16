import { NextRequest, NextResponse } from 'next/server'
import { getMatchesFromSheets, saveMatchToSheets, updateMatchInSheets, deleteMatchFromSheets } from '@/lib/sheets'

export async function GET() {
  try {
    const matches = await getMatchesFromSheets()
    return NextResponse.json(matches)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const match = await request.json()
    
    // Validate match data
    if (!match || !match.id) {
      return NextResponse.json({ 
        error: 'Invalid match data. Match ID is required.' 
      }, { status: 400 })
    }
    
    console.log('Saving match to sheets:', match.id)
    const success = await saveMatchToSheets(match)
    
    if (success) {
      return NextResponse.json({ message: 'Match saved successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to save match to Google Sheets' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in POST /api/matches:', error)
    return NextResponse.json({ 
      error: 'Failed to save match',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const match = await request.json()
    
    // Validate match data
    if (!match || !match.id) {
      return NextResponse.json({ 
        error: 'Invalid match data. Match ID is required.' 
      }, { status: 400 })
    }
    
    console.log('Updating match in sheets:', match.id)
    const result = await updateMatchInSheets(match)
    
    if (result === true) {
      return NextResponse.json({ message: 'Match updated successfully' })
    } else {
      const errorMsg = typeof result === 'object' && result?.error 
        ? result.error 
        : 'Failed to update match in Google Sheets'
      return NextResponse.json({ 
        error: errorMsg,
        details: typeof result === 'object' ? result : undefined
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in PUT /api/matches:', error)
    return NextResponse.json({ 
      error: 'Failed to update match',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('id')
    
    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 })
    }
    
    const success = await deleteMatchFromSheets(matchId)
    
    if (success) {
      return NextResponse.json({ message: 'Match deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
}
