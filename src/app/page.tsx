"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Trophy, MessageSquare, Shuffle } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-10" />
       {/* <Image
          src="/football-stadium-night-lights.jpg"
          alt="Football Stadium"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        /> */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-balance">
            FOOTBALL
            <span className="block text-primary">MANAGER</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
            Quản lý cầu thủ, cập nhật trận đấu, nhắn tin và sắp xếp đội hình
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="text-lg font-bold">
              <Link href="/players">Bắt đầu ngay</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight">TÍNH NĂNG</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/players" className="group">
            <Card className="p-8 h-full hover:border-primary transition-colors">
              <Users className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-3">Cầu thủ</h3>
              <p className="text-muted-foreground">Quản lý danh sách cầu thủ và chấm điểm kỹ năng</p>
            </Card>
          </Link>

          <Link href="/matches" className="group">
            <Card className="p-8 h-full hover:border-primary transition-colors">
              <Trophy className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-3">Trận đấu</h3>
              <p className="text-muted-foreground">Cập nhật và theo dõi kết quả các trận đấu</p>
            </Card>
          </Link>

          <Link href="/message" className="group">
            <Card className="p-8 h-full hover:border-primary transition-colors">
              <MessageSquare className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-3">Nhắn tin</h3>
              <p className="text-muted-foreground">Chat và trao đổi với các thành viên khác</p>
            </Card>
          </Link>

          <Link href="/team-balancer" className="group">
            <Card className="p-8 h-full hover:border-primary transition-colors">
              <Shuffle className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-3">Chia đội</h3>
              <p className="text-muted-foreground">Tự động sắp xếp đội hình cân bằng theo điểm</p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
