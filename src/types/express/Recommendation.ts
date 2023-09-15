export interface Recommendation {
    url: string;
    name: string;
    author: string;
    description: string;
    content_type: string;
    build_phase: string;
    creation_date: Date; //verify specific type for this one
    user_id: number;
    recommendation_type:
        | "I recommend this resource after having used it"
        | "I do not recommend this resource, having used it"
        | "I haven't used this resosurce but it looks promising";
    reason: string;
    likes: number;
    dislikes: number;
    tags: string;
}

export interface RecommendationWithVotes extends Recommendation {
    likes: number;
    dislikes: number;
}
