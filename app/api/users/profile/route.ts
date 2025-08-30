import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, gender, preference, photo, summary } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Upsert profile (update if exists, create if not)
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        gender: gender || '',
        preference: preference || '',
        photo: photo || '',
        summary: summary || '',
      },
      create: {
        userId,
        gender: gender || '',
        preference: preference || '',
        photo: photo || '',
        summary: summary || '',
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Save profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}