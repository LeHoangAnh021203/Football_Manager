# Hướng dẫn Setup Google Sheets cho Football Manager

## 📋 Bước 1: Tạo Google Sheet

1. Vào [Google Sheets](https://sheets.google.com)
2. Tạo file mới tên "Football Manager"
3. File sẽ tự động tạo sheet "Sheet1" (có thể xóa sau)

## 🔧 Bước 2: Tạo Google Apps Script

1. Trong Google Sheet, vào menu **Extensions** → **Apps Script**
2. Xóa toàn bộ code mặc định
3. Copy và paste toàn bộ code từ file `google-apps-script.js`
4. Lưu project (Ctrl+S) và đặt tên "Football Manager Script"

## ⚙️ Bước 3: Deploy Web App

1. Trong Apps Script editor, nhấn **Deploy** → **New deployment**
2. Chọn type: **Web app**
3. Cấu hình:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Nhấn **Deploy**
5. Copy **Web app URL** (sẽ có dạng: `https://script.google.com/macros/s/...`)

## 📊 Bước 4: Setup Sheets (Tự động)

1. Trong Apps Script editor, chọn function `setupSheets`
2. Nhấn **Run** để tạo các sheet cần thiết
3. Quay lại Google Sheet, bạn sẽ thấy 3 sheet mới:
   - **Players**: Lưu thông tin cầu thủ
   - **Matches**: Lưu thông tin trận đấu  
   - **Teams**: Lưu thông tin đội bóng

## 🔑 Bước 5: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục dự án:

```env
NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/YOUR_WEB_APP_URL_HERE/exec"
```

Thay `YOUR_WEB_APP_URL_HERE` bằng URL bạn copy ở bước 3.

## 🧪 Bước 6: Test Connection

1. Chạy ứng dụng: `npm run dev`
2. Mở browser console (F12)
3. Kiểm tra xem có lỗi kết nối nào không

## 📝 Cấu trúc Sheets

### Sheet "Players"
| ID | Name | Position | SkillPoints | Image | CreatedAt |
|----|------|----------|-------------|-------|-----------|
| 1 | Nguyễn Văn A | Tiền đạo | 8 | base64... | 1234567890 |

### Sheet "Matches"  
| ID | Team1 | Team2 | Score1 | Score2 | Date | Team1Players | Team2Players | CreatedAt |
|----|-------|-------|--------|--------|------|--------------|--------------|-----------|
| 1 | Đội A | Đội B | 2 | 1 | 2024-01-15 | [{"id":"1"...}] | [{"id":"2"...}] | 1234567890 |

### Sheet "Teams"
| TeamName | Players | TotalPoints | CreatedAt |
|----------|---------|-------------|-----------|
| Đội A | [{"id":"1"...}] | 45 | 1234567890 |

## 🚀 Các API Endpoints

Apps Script sẽ xử lý các actions sau:

### Players
- `getPlayers` - Lấy danh sách cầu thủ
- `savePlayer` - Lưu cầu thủ mới
- `updatePlayer` - Cập nhật cầu thủ
- `deletePlayer` - Xóa cầu thủ

### Matches
- `getMatches` - Lấy danh sách trận đấu
- `saveMatch` - Lưu trận đấu mới
- `updateMatch` - Cập nhật trận đấu
- `deleteMatch` - Xóa trận đấu

### Teams
- `saveTeams` - Lưu thông tin đội bóng

## 🔧 Troubleshooting

### Lỗi "Bad Request" hoặc Redirect Loop
- **Nguyên nhân**: Link bị redirect loop do vấn đề authentication
- **Giải pháp**:
  1. Đóng tất cả tab Google Script đang mở
  2. Truy cập trực tiếp: https://script.google.com
  3. Hoặc vào Google Sheet → Extensions → Apps Script
  4. Xóa cache và cookies của trình duyệt nếu cần

### Lỗi "Script not found"
- Kiểm tra URL web app có đúng không
- Đảm bảo đã deploy với quyền "Anyone"
- Kiểm tra URL có đầy đủ `/exec` ở cuối không

### Lỗi "Sheet not found"
- Chạy function `setupSheets` trong Apps Script
- Kiểm tra tên sheet có đúng không (Players, Matches, Teams)

### Lỗi CORS
- Apps Script tự động xử lý CORS
- Nếu vẫn lỗi, kiểm tra lại URL
- Đảm bảo đã deploy lại sau khi sửa code

### Cách truy cập Google Apps Script đúng cách:
1. **Cách 1**: Vào Google Sheet → Extensions → Apps Script
2. **Cách 2**: Truy cập https://script.google.com → Chọn project
3. **Không dùng**: Link có nhiều `continueUrl` lồng nhau (sẽ bị bad request)

## 📱 Sử dụng

1. **Thêm cầu thủ**: Dữ liệu sẽ tự động lưu vào Google Sheets
2. **Chia đội**: Thông tin đội sẽ được lưu vào sheet "Teams"
3. **Trận đấu**: Kết quả sẽ được lưu vào sheet "Matches"
4. **Đồng bộ**: Dữ liệu sẽ tự động sync giữa app và Google Sheets

## 🎯 Lợi ích

- ✅ Dữ liệu được lưu trữ an toàn trên Google Cloud
- ✅ Có thể xem/chỉnh sửa từ bất kỳ đâu
- ✅ Tự động backup
- ✅ Chia sẻ dễ dàng với người khác
- ✅ Miễn phí và không giới hạn
