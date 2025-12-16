import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Quản lý đội bóng
            <span className="block text-yellow-300">chuyên nghiệp</span>
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Hệ thống quản lý toàn diện giúp bạn theo dõi cầu thủ, lên kế hoạch trận đấu, 
            và phân tích thống kê để đưa đội bóng đến thành công.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/teams"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Bắt đầu ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-700 transition-colors">
              <Play className="mr-2 h-5 w-5" />
              Xem demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
