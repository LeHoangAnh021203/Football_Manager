# Các cách truy cập Google Apps Script khi bị lỗi

## 🔧 Cách 1: Truy cập trực tiếp từ Google Sheets (Khuyến nghị)

1. Mở trình duyệt mới (hoặc Incognito/Private mode)
2. Vào: https://sheets.google.com
3. Đăng nhập Google account
4. Tìm và mở file "Football Manager" (hoặc tạo mới nếu chưa có)
5. Trong Google Sheet, click menu **Extensions** → **Apps Script**

## 🔧 Cách 2: Tạo Script mới từ đầu

Nếu không thể truy cập script cũ:

1. Mở Google Sheet: https://sheets.google.com
2. Tạo file mới tên "Football Manager" (nếu chưa có)
3. Vào **Extensions** → **Apps Script**
4. Xóa code mặc định
5. Copy toàn bộ code từ file `google-apps-script.js` trong project
6. Paste vào editor
7. Lưu (Ctrl+S hoặc Cmd+S)
8. Đặt tên project: "Football Manager Script"

## 🔧 Cách 3: Truy cập qua script.google.com (thử lại)

1. Đóng TẤT CẢ tab Google đang mở
2. Xóa cache trình duyệt:
   - Chrome: Ctrl+Shift+Delete → Chọn "Cached images and files"
   - Hoặc dùng Incognito mode
3. Truy cập: https://script.google.com
4. Đăng nhập
5. Tìm project "Football Manager Script"

## 🔧 Cách 4: Tạo Script mới hoàn toàn

Nếu vẫn không được, tạo script mới:

### Bước 1: Tạo Google Sheet mới
1. Vào https://sheets.google.com
2. Tạo file mới: "Football Manager"
3. Lưu lại

### Bước 2: Tạo Apps Script
1. Trong Google Sheet, **Extensions** → **Apps Script**
2. Xóa code mặc định
3. Copy code từ `google-apps-script.js`
4. Paste vào
5. Lưu (Ctrl+S)

### Bước 3: Chạy setupSheets
1. Chọn function `setupSheets` từ dropdown
2. Nhấn **Run** (▶️)
3. Cho phép quyền truy cập nếu được hỏi
4. Quay lại Google Sheet → Sẽ thấy 3 sheet: Players, Matches, Teams

### Bước 4: Deploy Web App
1. Nhấn **Deploy** → **New deployment**
2. Chọn **Web app**
3. Cấu hình:
   - **Execute as**: Me
   - **Who has access**: **Anyone** ⚠️
4. Nhấn **Deploy**
5. **Copy URL** (sẽ có dạng: `https://script.google.com/macros/s/.../exec`)

### Bước 5: Cập nhật .env.local
```env
NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL="URL_VỪA_COPY"
```

## 🔧 Cách 5: Sử dụng Google Drive

1. Vào: https://drive.google.com
2. Tìm file Google Sheet "Football Manager"
3. Mở file
4. **Extensions** → **Apps Script**

## 🚨 Nếu vẫn không được

### Kiểm tra:
- [ ] Đã đăng nhập đúng Google account?
- [ ] Google account có quyền tạo Apps Script?
- [ ] Đã thử Incognito/Private mode?
- [ ] Đã xóa cache trình duyệt?

### Giải pháp cuối cùng:

**Tạo script mới hoàn toàn:**
1. Tạo Google Sheet mới
2. Tạo Apps Script mới
3. Copy code từ `google-apps-script.js`
4. Deploy với quyền "Anyone"
5. Copy URL mới
6. Update `.env.local`

## 💡 Tip

Nếu bạn có nhiều Google account, đảm bảo:
- Đăng nhập đúng account đã tạo Google Sheet
- Hoặc dùng account chính (không phải account phụ)

