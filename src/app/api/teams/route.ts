import { NextRequest, NextResponse } from 'next/server'
import { saveTeamsToSheets, getTeamsFromSheets } from '@/lib/sheets'

export async function GET() {
  try {
    const teams = await getTeamsFromSheets()
    return NextResponse.json(teams)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const teams = await request.json()
    
    // Validate teams data
    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid teams data. Expected an array of teams.' 
      }, { status: 400 })
    }
    
    console.log('Saving teams to sheets:', teams.length, 'teams')
    const success = await saveTeamsToSheets(teams)
    
    if (success) {
      return NextResponse.json({ message: 'Teams saved successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to save teams to Google Sheets' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in POST /api/teams:', error)
    return NextResponse.json({ 
      error: 'Failed to save teams',
      details: error.message 
    }, { status: 500 })
  }
}

