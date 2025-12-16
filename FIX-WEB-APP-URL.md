# Sửa lỗi Web App URL - Yêu cầu đăng nhập

## 🔍 Vấn đề

Khi truy cập URL Web App, bạn bị redirect đến trang đăng nhập Google. Điều này có nghĩa là:
- Web app chưa được deploy với quyền "Anyone" 
- Hoặc cần deploy lại

## ✅ Giải pháp

### Bước 1: Vào Google Apps Script Editor

**Cách 1 (Khuyến nghị):**
1. Mở Google Sheet: https://sheets.google.com
2. Mở file "Football Manager" 
3. Vào **Extensions** → **Apps Script**

**Cách 2:**
1. Truy cập: https://script.google.com
2. Chọn project "Football Manager Script"

### Bước 2: Deploy lại Web App với đúng quyền

1. Trong Apps Script Editor, nhấn **Deploy** → **Manage deployments**
2. Nếu đã có deployment:
   - Click vào icon **Edit** (bút chì) bên cạnh deployment
   - Hoặc tạo **New deployment**
3. Cấu hình:
   - **Type**: Web app
   - **Execute as**: **Me** (chọn tài khoản của bạn)
   - **Who has access**: **Anyone** ⚠️ (QUAN TRỌNG!)
4. Nhấn **Deploy**
5. **Copy URL mới** từ màn hình (URL sẽ có dạng: `https://script.google.com/macros/s/.../exec`)

### Bước 3: Cập nhật .env.local

Mở file `.env.local` và cập nhật:

```env
NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/AKfycbwvR9ReUc7x848QgEFZwGUMVU7j-sTrhg1dsmQioVzjkMm9Qdg5jEB9IK54PCthGofd4g/exec"
```

**Lưu ý:**
- URL phải có `/exec` ở cuối
- Không có dấu ngoặc kép thừa
- Không có khoảng trắng

### Bước 4: Test URL

Mở Browser Console (F12) và chạy:

```javascript
fetch('https://script.google.com/macros/s/AKfycbwvR9ReUc7x848QgEFZwGUMVU7j-sTrhg1dsmQioVzjkMm9Qdg5jEB9IK54PCthGofd4g/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'testConnection' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Google Apps Script is working!",
  "timestamp": "..."
}
```

**Nếu vẫn yêu cầu đăng nhập:**
- Deploy lại với quyền "Anyone"
- Đảm bảo chọn "Anyone" chứ không phải "Anyone with Google account"

### Bước 5: Restart Dev Server

```bash
# Dừng server (Ctrl+C)
npm run dev
```

## 🔧 Troubleshooting

### Vẫn yêu cầu đăng nhập sau khi deploy

1. **Kiểm tra quyền truy cập:**
   - Deploy → Manage deployments
   - Xem "Who has access" phải là **"Anyone"**
   - Nếu là "Only myself" → Sửa lại

2. **Deploy lại hoàn toàn:**
   - Xóa deployment cũ
   - Tạo deployment mới
   - Copy URL mới

3. **Kiểm tra Google Apps Script:**
   - Chạy function `testConnection` trong editor
   - Xem có lỗi gì không

### Lỗi CORS

Google Apps Script tự động xử lý CORS, nhưng nếu vẫn lỗi:
- Đảm bảo URL có `/exec` ở cuối
- Không dùng `/dev` (chỉ dùng khi test)

### URL không hoạt động

- Kiểm tra URL có đúng không
- Thử deploy lại và copy URL mới
- Đảm bảo không có ký tự thừa trong URL

## 📝 Checklist

- [ ] Web app đã được deploy
- [ ] "Who has access" = **"Anyone"**
- [ ] URL có `/exec` ở cuối
- [ ] `.env.local` đã được cập nhật
- [ ] Dev server đã được restart
- [ ] Test connection thành công

## 🎯 Sau khi sửa

1. Mở ứng dụng
2. Thử thêm một cầu thủ
3. Kiểm tra Browser Console (F12) - không còn lỗi 400
4. Kiểm tra Google Sheet - dữ liệu đã được lưu

