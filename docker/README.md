# Wachsia Backend — Docker Deployment

ระบบ Docker สำหรับ deploy Wachsia Backend (Node.js + Express) พร้อม MySQL Database

## 📋 สารบัญ

- [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
- [โครงสร้างไฟล์](#โครงสร้างไฟล์)
- [การติดตั้งและเริ่มใช้งาน](#การติดตั้งและเริ่มใช้งาน)
- [คำสั่ง Docker](#คำสั่ง-docker)
- [โครงสร้างฐานข้อมูล](#โครงสร้างฐานข้อมูล)
- [API Endpoints](#api-endpoints)
- [การทดสอบ API ด้วย Postman](#การทดสอบ-api-ด้วย-postman)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)

## 🔧 ข้อกำหนดเบื้องต้น

- [Docker](https://www.docker.com/get-started) >= 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.0

```bash
docker --version
docker compose version
```

## 📁 โครงสร้างไฟล์

```
docker/
├── docker-compose.yml          # กำหนดค่า services (db + backend)
├── Dockerfile                  # Build image สำหรับ Node.js backend
├── init.sql                    # SQL script สร้างตารางและ users
├── my.cnf                      # กำหนดค่า MySQL
├── wachsia-api.postman_collection.json  # Postman Collection
└── README.md
```

## 🚀 การติดตั้งและเริ่มใช้งาน

### 1. ตั้งค่า .env ที่ root project

Docker Compose จะดึง env จากไฟล์ `../.env` (root ของ project) ผ่าน flag `--env-file`

```env
NODE_ENV=development
PORT=8091
DB_HOST=localhost
DB_PORT=3306
DB_USER=<db_user>
DB_PASSWORD=<db_password>
DB_NAME=wachsia_app
DB_CONNECTION_LIMIT=10
```

### 2. เริ่มต้น services

```bash
cd docker
docker compose --env-file ../.env up -d
```

คำสั่งนี้จะ:
- สร้าง MySQL container พร้อม database `wachsia_app`
- รัน `init.sql` สร้างตารางและ DB users
- Build และเริ่ม backend บน port 8091
- Backend จะรอจนกว่า DB healthcheck ผ่านก่อนเริ่มทำงาน

### 3. ตรวจสอบสถานะ

```bash
docker compose --env-file ../.env ps
docker compose --env-file ../.env logs -f wachsia_backend
```

### 4. ทดสอบ health check

```bash
curl http://localhost:8091/health
```

## 🐳 คำสั่ง Docker

> ทุกคำสั่งต้องรันจากภายใน folder `docker/`

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `docker compose --env-file ../.env up -d` | เริ่มต้น services (background) |
| `docker compose --env-file ../.env down` | หยุดและลบ containers |
| `docker compose --env-file ../.env stop` | หยุด containers (ไม่ลบ) |
| `docker compose --env-file ../.env start` | เริ่ม containers ที่หยุดไว้ |
| `docker compose --env-file ../.env restart` | รีสตาร์ท containers |
| `docker compose --env-file ../.env ps` | ดูสถานะ containers |
| `docker compose --env-file ../.env logs -f` | ดู logs แบบ real-time |
| `docker compose --env-file ../.env up -d --build` | Build image ใหม่และเริ่มต้น |

### เชื่อมต่อ MySQL

```bash
docker exec -it wachsia_db mysql -uroot -p wachsia_app
```

### Backup / Restore

```bash
# Backup
docker exec wachsia_db mysqldump -uroot -p wachsia_app > backup.sql

# Restore
docker exec -i wachsia_db mysql -uroot -p wachsia_app < backup.sql
```

### ลบข้อมูลและเริ่มใหม่

```bash
docker compose --env-file ../.env down -v
docker compose --env-file ../.env up -d
```

## 📊 โครงสร้างฐานข้อมูล

| ตาราง | คำอธิบาย | คอลัมน์หลัก |
|-------|----------|-------------|
| user | ข้อมูลผู้ใช้ | id, username, point, email, password, image |
| community | ชุมชน | community_id, community_name, member_id |
| tree | ต้นไม้ของผู้ใช้ | tree_id, owner_id, level, experience |
| quest | ภารกิจ | quest_id, eco_point, instruction, progress, due, type, owner_id |
| scannedProduct | ประวัติสแกนสินค้า | scanner_id, product_name, scan_date, image, eco_score, eco_point |
| post | โพสต์ในชุมชน | post_id, poster_id, commu_id, post_date, caption, image |
| comment | ความคิดเห็น | comment_id, commentor_id, post_id, commu_id, caption |

### DB Users

| User | สิทธิ์ | ใช้งาน |
|------|--------|--------|
| root | ALL | Admin / maintenance |
| admin | ALL on wachsia_app | Database admin |
| wachsiausr | SELECT, INSERT, UPDATE, DELETE | Application backend |

## 🌐 API Endpoints

### User APIs — `/api/users/`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/findAllUsers` | ดึงข้อมูลผู้ใช้ทั้งหมด |
| GET | `/findByEmail?email=` | ค้นหาผู้ใช้จาก email |
| GET | `/findByUsername?username=` | ค้นหาผู้ใช้จาก username |
| GET | `/exists?email=` | ตรวจสอบว่า email มีอยู่ในระบบ |
| POST | `/register` | ลงทะเบียนผู้ใช้ใหม่ |
| POST | `/verifyPassword` | ตรวจสอบรหัสผ่าน |
| PUT | `/changePassword` | เปลี่ยนรหัสผ่าน |
| DELETE | `/deleteAccount` | ลบบัญชีผู้ใช้ |

### Tree APIs — `/api/trees/`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/level?userId=` | ดึงข้อมูล level ต้นไม้ของผู้ใช้ |

### Health Check

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/health` | ตรวจสอบสถานะ backend + DB |

## 🧪 การทดสอบ API ด้วย Postman

1. เปิด [Postman](https://www.postman.com/downloads/)
2. คลิก **Import** → เลือกไฟล์ `wachsia-api.postman_collection.json`
3. ตรวจสอบว่า services ทำงานอยู่: `docker compose --env-file ../.env ps`

### ตัวอย่าง Request Body

**Register** — `POST /api/users/register`
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Change Password** — `PUT /api/users/changePassword`
```json
{
  "email": "john@example.com",
  "currentPassword": "secret123",
  "newPassword": "newpass123"
}
```

**Delete Account** — `DELETE /api/users/deleteAccount`
```json
{
  "email": "john@example.com",
  "password": "newpass123"
}
```

## 🛠️ การแก้ไขปัญหา

### Port 3306 ถูกใช้งานอยู่

แก้ไข `DB_PORT` ใน `.env`:
```env
DB_PORT=3307
```

### Container ไม่ start

```bash
docker compose --env-file ../.env logs db
docker compose --env-file ../.env logs wachsia_backend
docker compose --env-file ../.env down -v && docker compose --env-file ../.env up -d
```

### เชื่อมต่อ DB ไม่ได้

```bash
docker compose --env-file ../.env ps   # ตรวจสอบ container ทำงานอยู่
curl http://localhost:8091/health       # ตรวจสอบ backend health
docker exec -it wachsia_db mysql -uroot -p -e "SELECT 1"
```

### ภาษาไทยแสดงผิด

```sql
SHOW VARIABLES LIKE 'char%';
-- ควรเป็น utf8mb4 ทั้งหมด
```

## 🔒 ข้อควรระวังด้านความปลอดภัย

- **ห้าม** commit ไฟล์ `.env` ขึ้น Git
- เปลี่ยน credentials ทั้งหมดก่อน deploy production
- Backend container รันด้วย non-root user
- ใช้ network isolation ระหว่าง services

---

**Backend:** Node.js 20 (Alpine) + Express 5  
**Database:** MySQL 8.0  
**Port:** 8091 (Backend) / 3306 (MySQL)
