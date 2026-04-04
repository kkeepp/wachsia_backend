-- =============================================
-- Wachsia App - Database Initialization Script
-- =============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create application users
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'ChT0NF41';
GRANT ALL PRIVILEGES ON wachsia_app.* TO 'admin'@'%';

CREATE USER IF NOT EXISTS 'wachsiausr'@'%' IDENTIFIED BY 'E9rJ3W7N';
GRANT SELECT, INSERT, UPDATE, DELETE ON wachsia_app.* TO 'wachsiausr'@'%';

FLUSH PRIVILEGES;

-- Core tables
CREATE TABLE IF NOT EXISTS user
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    username         VARCHAR(100)        NOT NULL,
    point            INT DEFAULT 0,
    email            VARCHAR(150) UNIQUE NOT NULL,
    password         VARCHAR(255)        NOT NULL,
    image            VARCHAR(255),
    -- if last_action_date is older than today; if it is, reset used_point_today to 0 before applying new points
    used_point_today INT DEFAULT 0,
    -- for limit watering/fertilizing
    last_action_date DATE
);

-- Seed data (password: 123456, hashed with bcrypt 10 rounds)
INSERT INTO user (username, point, email, password, image, used_point_today, last_action_date)
VALUES ('admin', 500, 'admin@wachsia.app', '$2b$10$AIPGPyr6wGLRij4RT5sR4.KuZuQE3CBNVUZkX5GzKdMvZS5PiV3Ea',
        'https://i.imgur.com/d2OWxrx.jpeg', 0, DATE '2026-03-01');

CREATE TABLE IF NOT EXISTS tree
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNIQUE,
    level       INT DEFAULT 1, -- 1, 2, 3, 4, 5
    experience  INT DEFAULT 0,
    tree_growth INT DEFAULT 1, -- 1, 2, 3, ...
    tree_phase  INT DEFAULT 1, -- 1, 2, 3, ...
    FOREIGN KEY (user_id) REFERENCES user (id)
        ON DELETE CASCADE
);

INSERT INTO tree (user_id, level, experience, tree_growth, tree_phase)
VALUES (1, 2, 50, 3, 1);

CREATE TABLE IF NOT EXISTS quest
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    quest_type  ENUM ('daily', 'challenge'),
    instruction TEXT,
    reward      INT,
    max         INT
);

INSERT INTO quest (quest_type, instruction, reward, max)
VALUES ('daily', 'เข้าสู่ระบบ', 10, 1),
       ('daily', 'สแกนสินค้าครบ 5 ชิ้น', 100, 5),
       ('daily', 'รดน้ำต้นไม้ 3 รอบ', 30, 3),
       ('challenge', 'สแกนสินค้าที่มีเกรด A ขึ้นไป 2 ชิ้น', 100, 2),
       ('challenge', 'สแกนสินค้าที่มีเกรด B ขึ้นไป 3 ชิ้น', 100, 3),
       ('challenge', 'สแกนสินค้าที่มีเกรด C ขึ้นไป 5 ชิ้น', 100, 5),
       ('challenge', 'สแกนสินค้าที่มีเกรด A ติดต่อกัน 3 วัน', 100, 3),
       ('challenge', 'ต้นไม้เติบโตถึงระดับ 2', 100, 2),
       ('challenge', 'ต้นไม้เติบโตถึงระดับ 4', 100, 4);

CREATE TABLE IF NOT EXISTS user_quest
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    quest_id    INT,
    status      ENUM ('in_progress', 'completed', 'claimed') DEFAULT 'in_progress',
    count       INT                                          DEFAULT 0,
    user_id     INT,
    assign_date DATE                                         DEFAULT (CURRENT_DATE),
    FOREIGN KEY (quest_id) REFERENCES quest (id),
    FOREIGN KEY (user_id) REFERENCES user (id)
        ON DELETE CASCADE
);

-- insert default set of quests(daily&challenge) when user creates new account
INSERT INTO user_quest (quest_id, status, count, user_id)
VALUES (1, 'in_progress', 0, 1),
       (2, 'in_progress', 0, 1),
       (3, 'in_progress', 0, 1),
       (4, 'in_progress', 0, 1),
       (5, 'in_progress', 0, 1),
       (6, 'in_progress', 0, 1),
       (7, 'in_progress', 0, 1),
       (8, 'in_progress', 0, 1),
       (9, 'in_progress', 0, 1);

CREATE TABLE IF NOT EXISTS product
(
    barcode      VARCHAR(15) PRIMARY KEY,
    product_name VARCHAR(255),
    image        VARCHAR(255),
    eco_grade    VARCHAR(20),
    eco_point    INT
);

INSERT INTO product
VALUES ('8997240600041', 'โอ๊ตไซด์ น้ำนมข้าวโอ๊ต รสจืด',
        'https://images.openfoodfacts.net/images/products/899/724/060/0041/front_th.64.400.jpg', 'c', 56),
       ('3415581117189', 'Caramel Biscuit & Cream Ice Cream',
        'https://images.openfoodfacts.net/images/products/341/558/111/7189/front_en.8.400.jpg', 'a', 76);

CREATE TABLE IF NOT EXISTS scan_history
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT,
    barcode      VARCHAR(15),
    scanned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id)
        ON DELETE CASCADE,
    FOREIGN KEY (barcode) REFERENCES product (barcode)
        ON DELETE CASCADE
);

INSERT INTO scan_history (user_id, barcode)
VALUES (1, '8997240600041');