import getCurrentUser from "./getCurrentUser";

export default async function checkAdminUser() {
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
    console.error("Error checking admin user:", error);
    return null;
  }
}