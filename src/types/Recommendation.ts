export interface Recommendation {
    url: string;
    name: string;
    author: string;
    description: string;
    content_type: string;
    build_phase: string;
    creation_date: Date;
    user_id: number;
    recommendation_type:
        | "I recommend this resource after having used it"
        | "I do not recommend this resource, having used it"
        | "I haven't used this resosurce but it looks promising";
    reason: string;
    tags: string;
    likes: number;
    dislikes: number;
}

export interface RecommendationCandidate
    extends Omit<Recommendation, "creation_date" | "likes" | "dislikes"> {}
