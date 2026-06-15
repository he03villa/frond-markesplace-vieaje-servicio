import { Activity } from "./activity";
import { MenuItem } from "./menu-item";
import { ProfileStat } from "./profile-stat";
import { Verification } from "./verification";

export interface UserProfile {
    id: number;
    name: string;
    avatar: string;
    title: string;
    bio: string;
    verified: boolean;
    rating: number;
    reviewCount: number;
    memberSince: string;
    location: string;
    phone: string;
    responseTime: string;
    completionRate: number;
    stats: ProfileStat[];
    skills: string[];
    verifications: Verification[];
    activities: Activity[];
    menuItems: MenuItem[];
}
