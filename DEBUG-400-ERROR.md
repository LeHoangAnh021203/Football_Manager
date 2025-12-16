# Hướng dẫn Debug Lỗi 400 (Bad Request)

## 🔍 Các bước kiểm tra

### 1. Kiểm tra Console Logs

Mở **Browser Console** (F12) và xem các log:
- `Calling Google Script:` - Xem action và URL
- `Response status:` - Xem status code
- `HTTP error response:` - Xem chi tiết lỗi

### 2. Kiểm tra Environment Variable

Đảm bảo file `.env.local` có:
```env
NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/YOUR_ID/exec"
```

**Lưu ý:**
- URL phải có `/exec` ở cuối
- Không có dấu `/` thừa
- Không có `continueUrl` hoặc tham số khác

### 3. Kiểm tra Google Apps Script

1. Vào Google Apps Script Editor
2. Chọn function `testConnection`
3. Nhấn **Run** để test
4. Xem kết quả có `success: true` không

### 4. Kiểm tra Web App Deployment

1. Vào **Deploy** → **Manage deployments**
2. Đảm bảo:
   - Status: **Active**
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Nếu có deployment mới, **Deploy lại** và copy URL mới

### 5. Kiểm tra Request Format

Lỗi 400 thường do:
- ❌ Thiếu `action` trong request
- ❌ Thiếu `data` khi action cần data
- ❌ Format JSON không đúng
- ❌ URL không đúng

### 6. Test trực tiếp Google Apps Script

Mở browser console và chạy:

```javascript
fetch('YOUR_WEB_APP_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'testConnection'
  })
})
.then(r => r.text())
.then(console.log)
.catch(console.error)
```

Nếu trả về `{"success":true,...}` → Script hoạt động tốt
Nếu trả về lỗi → Kiểm tra lại deployment

## 🛠️ Các lỗi thường gặp

### Lỗi: "No post data provided"
- **Nguyên nhân**: Request body rỗng hoặc không đúng format
- **Giải pháp**: Kiểm tra code gọi API có gửi đúng JSON không

### Lỗi: "Action is required"
- **Nguyên nhân**: Thiếu field `action` trong request
- **Giải pháp**: Đảm bảo request có format: `{ action: '...', data: ... }`

### Lỗi: "Sheet not found"
- **Nguyên nhân**: Sheet chưa được tạo
- **Giải pháp**: Chạy function `setupSheets` trong Apps Script

### Lỗi: "Invalid JSON"
- **Nguyên nhân**: Request body không phải JSON hợp lệ
- **Giải pháp**: Kiểm tra `JSON.stringify()` có đúng không

## 📝 Checklist Debug

- [ ] Environment variable đã được set
- [ ] Google Apps Script đã được deploy
- [ ] Web app URL có `/exec` ở cuối
- [ ] Quyền truy cập là "Anyone"
- [ ] Sheets đã được tạo (Players, Matches, Teams)
- [ ] Console logs hiển thị đầy đủ
- [ ] Test connection thành công

## 🔧 Quick Fix

Nếu vẫn lỗi, thử:

1. **Deploy lại Google Apps Script**
   - Deploy → Manage deployments → Edit → Deploy

2. **Xóa cache trình duyệt**
   - Ctrl+Shift+Delete → Clear cache

3. **Restart dev server**
   ```bash
   npm run dev
   ```

4. **Kiểm tra lại URL**
   - Copy URL mới từ Deploy
   - Update `.env.local`
   - Restart server

## 📞 Nếu vẫn không được

Kiểm tra:
1. Network tab trong DevTools → Xem request/response chi tiết
2. Google Apps Script Execution log → Xem có lỗi gì không
3. Console logs → Copy toàn bộ error message

