import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware désactivé - pas de vérification Supabase
  return NextResponse.next();
}

export const config = {
  matcher: [], // Ne matche aucune route
};