import { Trophy, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo và mô tả */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Trophy className="h-8 w-8 text-primary-500 mr-2" />
              <span className="text-2xl font-bold">Football Manager</span>
            </div>
            <p className="text-gray-300 mb-4">
              Hệ thống quản lý đội bóng chuyên nghiệp, giúp bạn theo dõi và quản lý mọi khía cạnh của đội bóng.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>contact@footballmanager.com</span>
              </div>
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="/teams" className="text-gray-300 hover:text-white">Đội bóng</a></li>
              <li><a href="/players" className="text-gray-300 hover:text-white">Cầu thủ</a></li>
              <li><a href="/matches" className="text-gray-300 hover:text-white">Trận đấu</a></li>
              <li><a href="/stats" className="text-gray-300 hover:text-white">Thống kê</a></li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Football Manager. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}
