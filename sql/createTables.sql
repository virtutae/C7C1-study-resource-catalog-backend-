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
    id SERIAL PRIMARY KEY ,
  	user_id int NOT NULL,
  	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    url varchar NOT NULL,
    FOREIGN KEY (url) REFERENCES recommendations(url) ON DELETE CASCADE,
    text varchar (500) NOT NULL,
	  creation_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);


DROP TABLE IF EXISTS study_list;
CREATE TABLE study_list (
	user_id int NOT NULL,
  	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  	url varchar NOT NULL,
  	creation_date timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (url) REFERENCES recommendations(url) ON DELETE CASCADE, 
  PRIMARY KEY (user_id, url)
);


DROP TABLE IF EXISTS tags_cloud;
CREATE TABLE tags_cloud (
tag_name varchar(50) PRIMARY KEY 
);


DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
	tag_name varchar ,
  	url varchar ,
  	FOREIGN KEY (tag_name) REFERENCES tags_cloud (tag_name) ON DELETE CASCADE,
  	FOREIGN KEY (url) REFERENCES recommendations (url) ON DELETE CASCADE,
  PRIMARY KEY (tag_name, url)
);


DROP TABLE IF EXISTS thumbnails;
CREATE TABLE thumbnails (
  id serial primary key,
  thumbnail_url varchar NOT NULL,  
  url varchar NOT NULL UNIQUE,
  FOREIGN KEY (url) REFERENCES recommendations (url) ON DELETE CASCADE
  );