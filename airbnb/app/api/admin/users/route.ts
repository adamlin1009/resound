import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import checkAdminUser from "@/app/actions/checkAdminUser";

export async function GET() {
  try {
    const currentUser = await checkAdminUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}