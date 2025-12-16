import { Users, Trophy, Calendar, Target } from 'lucide-react'

const stats = [
  {
    name: 'Cầu thủ',
    value: '25',
    icon: Users,
    description: 'Cầu thủ đang hoạt động',
  },
  {
    name: 'Trận thắng',
    value: '18',
    icon: Trophy,
    description: 'Trong mùa giải này',
  },
  {
    name: 'Trận đấu',
    value: '24',
    icon: Calendar,
    description: 'Đã thi đấu',
  },
  {
    name: 'Mục tiêu',
    value: '85%',
    icon: Target,
    description: 'Hoàn thành mục tiêu',
  },
]

export default function Stats() {
  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Thống kê tổng quan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Những con số ấn tượng về đội bóng của bạn
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-3xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <h4 className="mt-2 text-lg font-medium text-gray-900">
                  {stat.name}
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
