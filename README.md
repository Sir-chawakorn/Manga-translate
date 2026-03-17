# Manga Translate Studio

โปรเจกต์นี้เป็นแอปแปลมังงะบนเครื่อง โดยใช้ `Electron + Python + Gemini API` และเปิดให้แก้กล่องข้อความภาษาไทยก่อน export ภาพได้

## สิ่งที่ทำได้

- เปิดภาพมังงะจากเครื่อง
- เปิดไฟล์ PDF และ preview หน้าได้
- เลือกหน้าจาก PDF ก่อนค่อยแปล
- ส่งภาพไปให้ `gemini-2.5-flash-image` (Nano Banana) วิเคราะห์ตำแหน่งข้อความและแปลเป็นไทย
- แก้ข้อความไทยได้ทีละกล่อง
- ลากและย่อ/ขยายกล่องข้อความบนภาพได้
- Export เป็นไฟล์ PNG พร้อมข้อความภาษาไทย
- แสดง AI clean preview ถ้า Gemini ส่งภาพลบข้อความต้นฉบับกลับมา

## โครงสร้าง

- `backend/` FastAPI + Google GenAI SDK
- `electron/` หน้าต่าง Electron และ UI editor
- `package.json` สคริปต์รัน Electron

## ติดตั้ง

### 1. ติดตั้ง Python dependencies

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

### 2. ติดตั้ง Electron

```powershell
npm install
```

### 3. ตั้งค่า Gemini API key

เลือกอย่างใดอย่างหนึ่ง

#### ใส่ผ่าน UI

- เปิดแอปแล้ววาง API key ในช่อง `Gemini API Key`

#### ใส่ผ่านไฟล์ `.env`

```powershell
Copy-Item backend\.env.example backend\.env
```

จากนั้นแก้ `backend\.env`

```env
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-2.5-flash-image
```

## รันแอป

```powershell
npm start
```

Electron จะเปิดหน้าต่างหลัก และพยายาม spawn Python backend ให้อัตโนมัติผ่าน `.venv\Scripts\python.exe` ถ้ามี หรือใช้ `python` จากระบบ

## รันด้วยไฟล์ BAT

บน Windows คุณใช้ไฟล์พวกนี้ได้เลย

- `setup.bat` ติดตั้ง Python packages และ Node packages
- `run-all.bat` เช็กทุกอย่างให้อัตโนมัติ แล้วเปิดแอป Electron

ถ้าเป็นการเปิดครั้งแรก แนะนำให้ดับเบิลคลิก `run-all.bat` ได้เลย ระบบจะเรียก `setup.bat` ให้เองถ้ายังไม่มี dependency

## วิธีใช้

1. กด `เปิดภาพ / PDF`
2. ถ้าเป็น PDF ให้เลือกหน้าจากแถบ preview ก่อน
3. ใส่ `Gemini API Key`
4. กด `แปลเป็นไทย`
5. เลือกกล่องข้อความที่ Gemini หาเจอ
6. แก้คำแปล, ขนาดตัวอักษร, ตำแหน่ง, สี, และขนาดกล่องตามต้องการ
7. กด `Export PNG`

## หมายเหตุ

- `AI clean preview` เป็นภาพพรีวิวจาก Gemini ถ้าโมเดลส่งกลับมาได้ แต่ตอน export ระบบจะใช้ภาพต้นฉบับเป็นฐานและวาดกล่องข้อความทับ เพื่อคงความคมของไฟล์ต้นฉบับ
- เมื่อเลือกหน้าใหม่ใน PDF ระบบจะเปลี่ยน canvas ไปเป็นหน้าที่เลือก แล้วค่อยส่งหน้านั้นไปแปล
- งานบางหน้าที่มีตัวอักษรแน่นมาก หรือ balloon ซ้อนกัน อาจต้องขยับกล่องเอง
- ถ้า Gemini หา text region ไม่ครบ คุณสามารถกด `เพิ่มกล่องข้อความ` เองได้
