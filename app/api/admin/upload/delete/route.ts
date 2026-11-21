import { NextRequest } from 'next/server'
import { DELETE as handleDelete } from '../route'

export const dynamic = 'force-dynamic'

/**
 * Alternative dedicated deletion endpoint.
 * Supports both DELETE and POST for maximum client compatibility.
 */
export async function DELETE(request: NextRequest) {
  return handleDelete(request)
}

export async function POST(request: NextRequest) {
  return handleDelete(request)
}
