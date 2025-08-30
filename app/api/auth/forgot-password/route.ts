import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    // In a real app, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with expiry
    // 3. Send email with reset link
    
    // For demo purposes, we'll just return success
    return NextResponse.json({ 
      message: 'Password reset instructions sent to your email' 
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}