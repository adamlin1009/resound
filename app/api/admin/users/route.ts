import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import checkAdminUser from "@/app/actions/checkAdminUser";

export async function GET(request: Request) {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.user.count();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            reservations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: skip,
      take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users,
      totalCount,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}