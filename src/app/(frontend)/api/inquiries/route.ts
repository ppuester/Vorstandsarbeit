import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await req.json()

    // Erstelle die Anfrage
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        studentPhone: data.studentPhone || undefined,
        studentAge: data.studentAge || undefined,
        studentCity: data.studentCity,
        licenseClass: data.licenseClass,
        preferredStart: data.preferredStart || undefined,
        courseType: data.courseType || undefined,
        hasFirstAid: data.hasFirstAid || false,
        hasEyeTest: data.hasEyeTest || false,
        preferences: data.preferences || [],
        preferredLanguage: data.preferredLanguage || undefined,
        message: data.message || undefined,
        budgetRange: data.budgetRange || undefined,
        drivingSchools: data.drivingSchools,
        privacyAccepted: data.privacyAccepted,
        status: 'pending',
      },
    })

    return NextResponse.json({ doc: inquiry }, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen der Anfrage:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Anfrage' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token erforderlich' },
        { status: 400 }
      )
    }

    // Finde Anfrage anhand des Tokens
    const inquiries = await payload.find({
      collection: 'inquiries',
      where: {
        accessToken: { equals: token },
      },
      depth: 2, // Lade auch die verknüpften Fahrschulen
    })

    if (inquiries.docs.length === 0) {
      return NextResponse.json(
        { error: 'Anfrage nicht gefunden' },
        { status: 404 }
      )
    }

    const inquiry = inquiries.docs[0]

    // Lade auch die Antworten
    const responses = await payload.find({
      collection: 'inquiry-responses',
      where: {
        inquiry: { equals: inquiry.id },
      },
      depth: 2, // Lade auch die verknüpften Fahrschulen
      sort: '-createdAt',
    })

    return NextResponse.json({
      inquiry,
      responses: responses.docs,
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Anfrage:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Anfrage' },
      { status: 500 }
    )
  }
}
