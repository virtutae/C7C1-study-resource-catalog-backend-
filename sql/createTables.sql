DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id serial PRIMARY KEY,
    user_name varchar(40) NOT NULL UNIQUE,
    is_faculty boolean NOT NULL
);

DROP TABLE IF EXISTS recommendations;
CREATE TABLE recommendations(
    url varchar PRIMARY KEY,
    name varchar(255) NOT NULL,
    author varchar(255) NOT NULL,
    description varchar NOT NULL,
  	tags varchar NOT NULL,
    content_type varchar(255) NOT NULL,
    build_phase varchar(255) NOT NULL,
    creation_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    recommendation_type varchar(255) NOT NULL CHECK (
        recommendation_type IN (
            'I recommend this resource after having used it',
            'I do not recommend this resource, having used it',
            'I haven''t used this resource but it looks promising'
        )
    ),
    reason varchar (255) NOT NULL
);


DROP TABLE IF EXISTS votes;

CREATE TABLE votes (
    user_id int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    url varchar NOT NULL,
    FOREIGN KEY (url) REFERENCES recommendations(url) ON DELETE CASCADE,
  PRIMARY KEY (user_id, url),
    is_like BOOLEAN NOT NULL
);


DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY ,
  	user_id int NOT NULL,
  	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    recommendation_url varchar NOT NULL,
    FOREIGN KEY (recommendation_url) REFERENCES recommendations(url) ON DELETE CASCADE,
    text varchar (500) NOT NULL
);

DROP TABLE IF EXISTS study_list;
CREATE TABLE study_list (
	user_id int NOT NULL,
  	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  	url varchar NOT NULL,
    FOREIGN KEY (url) REFERENCES recommendations(url) ON DELETE CASCADE, 
  PRIMARY KEY (user_id, url)
);


DROP TABLE IF EXISTS tags_cloud;
CREATE TABLE tags_cloud (
tag_name varchar(50) PRIMARY KEY 
);

DROP TABLE IF EXISTS tag_recommendation;
CREATE TABLE tags (
	tag_name varchar ,
  	url varchar ,
  	FOREIGN KEY (tag_name) REFERENCES tags_cloud (tag_name),
  	FOREIGN KEY (url) REFERENCES recommendations (url),
  PRIMARY KEY (tag_name, url)
);

  SELECT recommendations.url, COUNT(votes.is_like) AS like_count
FROM votes 
LEFT JOIN recommendations ON votes.url = recommendations.url
WHERE votes.is_like = true
GROUP BY recommendations.url;

SELECT recommendations.url, COUNT(votes.is_like) AS dislike_count
FROM votes 
LEFT JOIN recommendations ON votes.url = recommendations.url
WHERE votes.is_like = false
GROUP BY recommendations.url;

SELECT r.*, COALESCE(likes.like_count, 0) AS like_count, COALESCE(dislikes.dislike_count, 0) AS dislike_count, COALESCE(tags.tag_list, '') AS tags
FROM recommendations r
LEFT JOIN (
    SELECT url, COUNT(*) AS like_count
    FROM votes
    WHERE is_like = true
    GROUP BY url
) AS likes ON r.url = likes.url
LEFT JOIN (
    SELECT url, COUNT(*) AS dislike_count
    FROM votes
    WHERE is_like = false
    GROUP BY url
) AS dislikes ON r.url = dislikes.url
LEFT JOIN (
    SELECT url, STRING_AGG(tag_name, '') AS tag_list
    FROM tags
    GROUP BY url
) AS tags ON r.url = tags.url
ORDER BY r.creation_date DESC LIMIT 10;

