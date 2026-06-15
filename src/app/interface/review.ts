import { ReviewImage } from "./review-image";
import { ReviewReply } from "./review-reply";
import { Reviewer } from "./reviewer";

export interface Review {
    id: string;
    reviewer: Reviewer;
    rating: number;
    title: string;
    text: string;
    date: string;
    relative_times: string;
    images: ReviewImage[];
    likes: number;
    liked: boolean;
    reply?: ReviewReply;
    tags: string[];
    helpful: number;
    serviceType: string;
}
