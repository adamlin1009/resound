import getCurrentUser from "./getCurrentUser";
import { SafeUser } from "@/types";

export default async function checkAdminUser(): Promise<SafeUser | null> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return null;
    }

    if (!currentUser.isAdmin) {
      return null;
    }

    return currentUser;
  } catch (error) {
    return null;
  }
}