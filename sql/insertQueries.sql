INSERT INTO votes (user_id, url, is_like) VALUES (14, 'https://start.spring.io/', true);
(13, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet', true),
(11, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet', true),
(14, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet', true),

(1, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet', null),
(2, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet', false),
(3, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet', false);

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
        'https://start.spring.io/',
        'Spring-docker',
        'Codecademy',
        'Cheatsheet on how to use classes in JS',
        'article',
        'week 11',
        CURRENT_TIMESTAMP,
        1,
        'I haven''t used this resource but it looks promising',
        'I think it''s useful'
    ), 
    (
        'https://katalon.com/resources-center/blog/end-to-end-e2e-testing',
        'E2E testing',
        'Codecademy',
        'Cheatsheet on how to use classes in JS',
        'article',
        'week 11',
        CURRENT_TIMESTAMP,
        2,
        'I haven''t used this resource but it looks promising',
        'I think it''s useful'
    );

    INSERT INTO tags_cloud (tag_name) VALUES 
('#JavaScript'),
('#TypeScript'),
('#Front-End-Development'),
('#Web-Development'),
('#Programming'),
('#Node.js'),
('#React'),
('#ES6'),
('#jQuery'),
('#AJAX'),
('#JSON'),
('#Promises'),
('#Asynchronous-Programming'),
('#NPM'),
('#Module-Systems'),
('#Express.js'),
('#RESTful-APIs'),
('#Webpack'),
('#Babel'),
('#Redux'),
('#DOM-Manipulation'),
('#Event-Handling'),
('#Front-End-Frameworks'),
('#JavaScript-Testing'),
('#TypeScript-Compiler'),
('#Type-Annotations'),
('#Design-Patterns'),
('#Java'),
('#Java-Development'),
('#Java-Programming'),
('#Java-Design-Patterns'),
('#Java-JDBC'),
('#Java-RESTful-Web-Services'),
('#Java-Android-Development'),
('#Java-GUI'),
('#GIT'),
('#SQL'),
('#Postgres'),
('#API'),
('#DB'),
('#HTTP-requests');


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

INSERT INTO tags (tag_name, url) VALUES ('#React', 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet'),
('#JavaScript', 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet');

INSERT INTO study_list (user_id, url) VALUES (2, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet'),
(3, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet'),
(4, 'https://www.codecademy.com/learn/webdev-intermediate-javascript/modules/learn-javascript-classes/cheatsheet'),
(2, 'https://start.spring.io/');


INSERT INTO thumbnails (thumbnail_url,url) VALUES 
('https://images.codecademy.com/social/logo-codecademy-social.png', 'https://www.codecademy.com/')