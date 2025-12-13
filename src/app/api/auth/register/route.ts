import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation basique
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { detail: 'Email, mot de passe et nom sont requis' },
        { status: 400 }
      )
    }

    // Envoyer la requête au backend FastAPI
    const fastApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

    const response = await fetch(`${fastApiUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        name: body.name,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { detail: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
