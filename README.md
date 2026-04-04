# Wachsia Backend

REST API backend สำหรับแอปพลิเคชัน Wachsia — ระบบ eco-friendly community ที่รองรับการจัดการผู้ใช้, ต้นไม้, ภารกิจ, และการสแกนสินค้า

## Tech Stack

- **Runtime:** Node.js >= 18
- **Framework:** Express 5
- **Database:** MySQL 8.0
- **Validation:** Zod 4
- **Auth:** bcrypt
- **Logging:** Pino
- **Testing:** Vitest + Supertest

## โครงสร้างโปรเจกต์

```
wachsia_backend/
├── controllers/        # Request handlers + validation
├── services/           # Business logic + DB queries
├── routes/             # Express route definitions
├── middleware/          # Error handler, response helpers
├── db_config/          # MySQL connection pool
├── docker/             # Docker deployment files
├── tests/              # Unit & integration tests
├── app.js              # Express app setup
├── server.js           # Server entry point
└── logger.js           # Pino logger config
```

## เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า environment

```bash
cp .env.example .env   # หรือสร้าง .env ตาม format ด้านล่าง
```

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

### 3. รัน development server

```bash
npm run dev
```

### 4. รัน production

```bash
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

### User APIs — `/api/users/`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/findAllUsers` | ดึงข้อมูลผู้ใช้ทั้งหมด |
| GET | `/findByEmail?email=` | ค้นหาจาก email |
| GET | `/findByUsername?username=` | ค้นหาจาก username |
| GET | `/exists?email=` | ตรวจสอบ email ซ้ำ |
| POST | `/register` | ลงทะเบียน (สร้าง tree + assign quests อัตโนมัติ) |
| POST | `/verifyPassword` | ตรวจสอบรหัสผ่าน |
| POST | `/uploadImage` | อัพโหลดรูปโปรไฟล์ |
| PUT | `/changePassword` | เปลี่ยนรหัสผ่าน |
| PUT | `/changeUsername` | เปลี่ยน username |
| DELETE | `/deleteAccount` | ลบบัญชี |

### Tree APIs — `/api/trees/`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/level?userId=` | ดึงข้อมูลต้นไม้ (level, exp, growth, phase) |
| GET | `/ranking` | อันดับต้นไม้ทั้งหมด |
| POST | `/addExp` | เพิ่ม exp ต้นไม้ (ใช้ point, จำกัด 500/วัน) |

### User Quest APIs — `/api/user-quests/`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/findByUser?userId=` | ดึง quests ทั้งหมดของ user |
| GET | `/findById?userQuestId=` | ดึง quest ตาม ID |
| PUT | `/updateProgress` | อัพเดท progress (count) |
| POST | `/claimReward` | เคลม reward เมื่อ quest สำเร็จ |

### Scan History APIs — `/api/scan-history/`

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/product?barcode=` | ค้นหาสินค้าจาก barcode |
| GET | `/history?userId=` | ประวัติการสแกนทั้งหมด |
| GET | `/monthly?userId=&year=&month=` | สรุปรายเดือน |
| GET | `/daily?userId=&year=&month=&day=` | รายละเอียดรายวัน |
| POST | `/scan` | สแกนสินค้า (บันทึก + เพิ่ม point) |

## Testing

```bash
npm test            # รัน tests ครั้งเดียว
npm run test:watch  # รัน tests แบบ watch mode
```

## Docker Deployment

ดูรายละเอียดที่ [docker/README.md](docker/README.md)

```bash
cd docker
# แก้ไข credentials ใน .env ที่ root project
docker compose --env-file ../.env up -d
```

## Scripts

| Script | คำอธิบาย |
|--------|----------|
| `npm start` | รัน production server |
| `npm run dev` | รัน development server (nodemon) |
| `npm test` | รัน tests |
| `npm run test:watch` | รัน tests แบบ watch mode |
