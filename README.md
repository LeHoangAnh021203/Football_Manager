# Football Manager

Ứng dụng quản lý đội bóng chuyên nghiệp được xây dựng với Next.js 14, TypeScript và Tailwind CSS.

## 🚀 Tính năng

- **Trang chủ**: Giao diện chào mừng với thống kê tổng quan
- **Quản lý đội bóng**: Xem danh sách, thông tin chi tiết các đội bóng
- **Quản lý cầu thủ**: Theo dõi thông tin cá nhân, kỹ năng và thành tích
- **Lịch thi đấu**: Quản lý trận đấu, kết quả và lịch trình
- **Thống kê**: Phân tích hiệu suất và báo cáo chi tiết
- **Responsive Design**: Tối ưu cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **ESLint** - Code linting

## 📦 Cài đặt

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd football-manager
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Chạy development server:**
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt:**
   Truy cập [http://localhost:3000](http://localhost:3000)

## 🏗️ Cấu trúc dự án

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── teams/             # Teams page
│   ├── players/           # Players page
│   ├── matches/           # Matches page
│   └── stats/             # Statistics page
├── components/             # Reusable components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Footer
│   ├── Hero.tsx           # Hero section
│   ├── Features.tsx       # Features section
│   └── Stats.tsx          # Stats section
```

## 🎨 Giao diện

- **Header**: Navigation với menu responsive
- **Hero Section**: Banner chính với call-to-action
- **Features**: Giới thiệu các tính năng chính
- **Stats**: Thống kê tổng quan
- **Footer**: Thông tin liên hệ và liên kết

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Navigation menu collapse trên mobile
- Grid layout tự động điều chỉnh

## 🚀 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔧 Cấu hình

### Tailwind CSS
- Custom colors trong `tailwind.config.js`
- Responsive utilities
- Component classes

### TypeScript
- Strict mode enabled
- Path aliases (@/*)
- Next.js types

### Next.js
- App Router enabled
- TypeScript support
- ESLint integration

## 📄 Trang

- **/** - Trang chủ với hero, features và stats
- **/teams** - Quản lý đội bóng
- **/players** - Quản lý cầu thủ  
- **/matches** - Lịch thi đấu
- **/stats** - Thống kê và báo cáo

## 🎯 Tính năng tương lai

- [ ] Authentication & Authorization
- [ ] Database integration
- [ ] Real-time updates
- [ ] Advanced statistics
- [ ] Mobile app
- [ ] Multi-language support

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Liên hệ

- Email: contact@footballmanager.com
- Phone: +84 123 456 789
- Address: Hà Nội, Việt Nam
