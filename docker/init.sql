-- =============================================
-- Wachsia App - Database Initialization Script
-- =============================================

-- Create application users
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'ChT0NF41';
GRANT ALL PRIVILEGES ON wachsia_app.* TO 'admin'@'%';

CREATE USER IF NOT EXISTS 'wachsiausr'@'%' IDENTIFIED BY 'E9rJ3W7N';
GRANT SELECT, INSERT, UPDATE, DELETE ON wachsia_app.* TO 'wachsiausr'@'%';

FLUSH PRIVILEGES;

-- Core tables
CREATE TABLE IF NOT EXISTS user
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    point    INT DEFAULT 0,
    email    VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    image    VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS community
(
    community_id   INT AUTO_INCREMENT PRIMARY KEY,
    community_name VARCHAR(255),
    member_id      INT,
    FOREIGN KEY (member_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS tree
(
    tree_id    INT AUTO_INCREMENT PRIMARY KEY,
    owner_id   INT UNIQUE,
    level      INT DEFAULT 1,
    experience INT DEFAULT 0,
    FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS quest
(
    quest_id    INT AUTO_INCREMENT PRIMARY KEY,
    eco_point   INT,
    instruction TEXT,
    progress    INT DEFAULT 0,
    due         DATE,
    type        VARCHAR(50),
    owner_id    INT,
    FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS scannedProduct
(
    scanner_id   INT,
    product_name VARCHAR(255),
    scan_date    DATETIME,
    image        VARCHAR(255),
    eco_score    INT,
    eco_point    INT,
    PRIMARY KEY (scanner_id, scan_date),
    FOREIGN KEY (scanner_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS post
(
    post_id     INT AUTO_INCREMENT PRIMARY KEY,
    poster_id   INT,
    commu_id    INT,
    post_date   DATETIME,
    caption     TEXT,
    image       VARCHAR(255),
    favoriteAmt INT DEFAULT 0,
    commentAmt  INT DEFAULT 0,
    FOREIGN KEY (poster_id) REFERENCES user (id),
    FOREIGN KEY (commu_id) REFERENCES community (community_id)
);

CREATE TABLE IF NOT EXISTS comment
(
    comment_id   INT AUTO_INCREMENT PRIMARY KEY,
    commentor_id INT,
    post_id      INT,
    commu_id     INT,
    caption      TEXT,
    FOREIGN KEY (commentor_id) REFERENCES user (id),
    FOREIGN KEY (post_id) REFERENCES post (post_id),
    FOREIGN KEY (commu_id) REFERENCES community (community_id)
);

-- Seed data (password: 123456, hashed with bcrypt 10 rounds)
INSERT INTO user (id, username, email, password, image)
VALUES (0, 'admin', 'admin@wachsia.app', '$2b$10$AIPGPyr6wGLRij4RT5sR4.KuZuQE3CBNVUZkX5GzKdMvZS5PiV3Ea', 'https://i.imgur.com/d2OWxrx.jpeg');
