DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id serial PRIMARY KEY,
    user_name varchar(40) NOT NULL UNIQUE,
    is_faculty boolean NOT NULL
);
INSERT INTO users (user_name, is_faculty)
VALUES ('Adil', false),
    ('Ana', false),
('Beth', false),
('Carlton', false),
('Cynthia', false),
('Dani', false),
    ('Henry', false),
('HoKei', false),
('Julieta', false),
('Laura', false),
('Oskar', false),
    ('Rosie', false),
('Silviu', false),
('Stephanie', false),
('Tom', false),
('Tomasz', false),
('Viky', false),
('Łucja', false),
    ('Neill', true),
('Katie', true),
('Nico', true),
('Marta', true);
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
INSERT INTO recommendations (
        url,
        name,
        author,
        description,
        content_type,
        build_phase,
        creation_date,
        user_id,
        recommendation_type,
        reason
    )
VALUES(
        'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet',
        'Classes in JS',
        'Codecademy',
        'Cheatsheet on how to use classes in JS',
        'article',
        'week 11',
        CURRENT_TIMESTAMP,
        13,
        'I haven''t used this resource but it looks promising',
        'I think it''s useful'
    );

DROP TABLE IF EXISTS votes;

CREATE TABLE votes (
    user_id int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    url varchar NOT NULL,
    FOREIGN KEY (url) REFERENCES recommendations(url),
  PRIMARY KEY (user_id, url),
    is_like BOOLEAN
);


DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY ,
  	user_id int NOT NULL,
  	FOREIGN KEY (user_id) REFERENCES users(id),
    recommendation_url varchar,
    FOREIGN KEY (recommendation_url) REFERENCES recommendations(url),
    text varchar (500)
);

DROP TABLE IF EXISTS study_list;
CREATE TABLE study_list (
	user_id int NOT NULL,
  	FOREIGN KEY (user_id) REFERENCES users(id),
  	url varchar NOT NULL,
    FOREIGN KEY (url) REFERENCES recommendations(url), 
  PRIMARY KEY (user_id, url)
);


DROP TABLE IF EXISTS tags_cloud;
CREATE TABLE tags_cloud (
tag_name varchar(50) PRIMARY KEY 
);

DROP TABLE IF EXISTS tag_recommendation;
CREATE TABLE tags (
	tag_name varchar ,
  	recommendation_url varchar ,
  	FOREIGN KEY (tag_name) REFERENCES tags_cloud (tag_name),
  	FOREIGN KEY (recommendation_url) REFERENCES recommendations (url),
  PRIMARY KEY (tag_name, recommendation_url)
);

INSERT into tags_cloud (tag_name) VALUES 
('JavaScript'),
  ('TypeScript'),
  ('Front-End Development'),
  ('Web Development'),
  ('Programming'),
  ('Node.js'),
  ('React'),
  ('ES6'),
  ('jQuery'),
  ('AJAX'),
  ('JSON'),
  ('Promises'),
  ('Asynchronous Programming'),
  ('NPM'),
  ('Module Systems'),
  ('Express.js'),
  ('RESTful APIs'),
  ('Webpack'),
  ('Babel'),
  ('Redux'),
  ('DOM Manipulation'),
  ('Event Handling'),
  ('Front-End Frameworks'),
  ('JavaScript Testing'),
  ('TypeScript Compiler'),
  ('Type Annotations'),
  ('Design Patterns'),
  ('Java'),
  ('Java Development'),
  ('Java Programming'),
  ('Java Design Patterns'),
  ('Java JDBC'),
  ('Java RESTful Web Services'),
  ('Java Android Development'),
  ('Java GUI'),
  ('GIT'),
  ('SQL'),
  ('Postgres'),
  ('API'),
  ('DB'),
  ('HTTP requests'),
  ('Axios'),