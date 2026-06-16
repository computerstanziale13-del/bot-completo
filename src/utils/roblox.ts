import axios from "axios";

export interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  avatarUrl: string;
}

export async function getRobloxUser(username: string): Promise<RobloxUser | null> {
  try {
    const searchRes = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      { usernames: [username], excludeBannedUsers: false },
      { timeout: 8000 }
    );

    const users = searchRes.data?.data;
    if (!users || users.length === 0) return null;

    const user = users[0] as { id: number; name: string; displayName: string };

    const avatarRes = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`,
      { timeout: 8000 }
    );

    const avatarData = avatarRes.data?.data?.[0];
    const avatarUrl: string =
      avatarData?.state === "Completed"
        ? avatarData.imageUrl
        : `https://www.roblox.com/headshot-thumbnail/image?userId=${user.id}&width=150&height=150&format=png`;

    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      avatarUrl,
    };
  } catch {
    return null;
  }
}
