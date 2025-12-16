"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shuffle, Users, Star, CheckSquare, Square, Trophy, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Player {
  id: string
  name: string
  position: string
  skillPoints: number
  image?: string
  createdAt?: number
}

interface Team {
  name: string
  players: Player[]
  totalPoints: number
}

export default function TeamBalancerPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  const [teams, setTeams] = useState<Team[]>([])
  const [numberOfTeams, setNumberOfTeams] = useState<2 | 3>(2)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true)
  const [isBalancing, setIsBalancing] = useState(false)

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoadingPlayers(true)
        const response = await fetch('/api/players');
        if (response.ok) {
          const playersData = await response.json();
          setPlayers(playersData);
          // Sync to localStorage as backup
          localStorage.setItem("football-players", JSON.stringify(playersData));
        } else {
          // Fallback to localStorage if API fails
          const stored = localStorage.getItem("football-players");
          if (stored) {
            setPlayers(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error('Error loading players:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem("football-players");
        if (stored) {
          setPlayers(JSON.parse(stored));
        }
      } finally {
        setIsLoadingPlayers(false)
      }
    };
    
    // Load initially
    loadPlayers();
    
    // Auto-sync every 30 seconds from Google Sheets
    const syncInterval = setInterval(() => {
      loadPlayers();
    }, 30000); // 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(syncInterval);
  }, [])

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(playerId)) {
        newSelected.delete(playerId)
      } else {
        newSelected.add(playerId)
      }
      return newSelected
    })
  }

  const toggleSelectAll = () => {
    if (selectedPlayers.size === players.length) {
      // Deselect all
      setSelectedPlayers(new Set())
    } else {
      // Select all
      setSelectedPlayers(new Set(players.map((p) => p.id)))
    }
  }

  const isGoalkeeper = (player: Player): boolean => {
    const position = player.position.toLowerCase()
    return position.includes("thủ môn") || position.includes("thu mon") || position.includes("goalkeeper") || position.includes("gk")
  }

  const balanceTeams = async () => {
    const selected = players.filter((p) => selectedPlayers.has(p.id))
    const minPlayers = numberOfTeams === 2 ? 2 : 3
    if (selected.length < minPlayers) return

    setIsBalancing(true)

    try {
      // Kiểm tra trùng cầu thủ trong danh sách đã chọn
      const playerIds = selected.map(p => p.id)
      const uniqueIds = new Set(playerIds)
      if (playerIds.length !== uniqueIds.size) {
        alert("Có cầu thủ bị trùng trong danh sách. Vui lòng kiểm tra lại.")
        return
      }

      // Tách thủ môn và cầu thủ khác
      const goalkeepers = selected.filter(isGoalkeeper)
      const otherPlayers = selected.filter((p) => !isGoalkeeper(p))

      // Sắp xếp thủ môn và cầu thủ khác theo điểm kỹ năng (giảm dần)
      const sortedGoalkeepers = [...goalkeepers].sort((a, b) => b.skillPoints - a.skillPoints)
      const sortedOtherPlayers = [...otherPlayers].sort((a, b) => b.skillPoints - a.skillPoints)
      const shouldBalanceGoalkeepers = goalkeepers.length >= numberOfTeams

      // Khởi tạo các đội
      const teamNames = numberOfTeams === 2 ? ["Đội A", "Đội B"] : ["Đội A", "Đội B", "Đội C"]
      const newTeams: Team[] = teamNames.map((name) => ({
        name,
        players: [],
        totalPoints: 0,
      }))

      // Set để theo dõi cầu thủ đã được phân phối (đảm bảo không trùng)
      const distributedPlayerIds = new Set<string>()

      // Phân phối thủ môn trước (mỗi đội 1 thủ môn) khi có đủ
      if (shouldBalanceGoalkeepers) {
        sortedGoalkeepers.slice(0, numberOfTeams).forEach((gk, index) => {
          if (distributedPlayerIds.has(gk.id)) {
            console.error(`Cầu thủ ${gk.name} đã được phân phối trước đó!`)
            return
          }
          newTeams[index].players.push(gk)
          newTeams[index].totalPoints += gk.skillPoints
          distributedPlayerIds.add(gk.id)
        })
      }

      // Phân phối các cầu thủ còn lại (bao gồm thủ môn thừa nếu có)
      const remainingGoalkeepers = shouldBalanceGoalkeepers
        ? sortedGoalkeepers.slice(numberOfTeams)
        : sortedGoalkeepers
      const allRemainingPlayers = [...remainingGoalkeepers, ...sortedOtherPlayers]

      // Phân phối theo thuật toán cân bằng điểm
      allRemainingPlayers.forEach((player) => {
        // Kiểm tra cầu thủ chưa được phân phối
        if (distributedPlayerIds.has(player.id)) {
          console.error(`Cầu thủ ${player.name} đã được phân phối trước đó!`)
          return
        }

        // Tìm đội có điểm thấp nhất
        const teamWithLowestPoints = newTeams.reduce((min, team) =>
          team.totalPoints < min.totalPoints ? team : min
        )
        teamWithLowestPoints.players.push(player)
        teamWithLowestPoints.totalPoints += player.skillPoints
        distributedPlayerIds.add(player.id)
      })

      // Kiểm tra lại để đảm bảo không có cầu thủ trùng giữa các đội
      const allDistributedIds: string[] = []
      newTeams.forEach(team => {
        team.players.forEach(player => {
          if (allDistributedIds.includes(player.id)) {
            console.error(`Cầu thủ ${player.name} (ID: ${player.id}) xuất hiện trong nhiều đội!`)
          }
          allDistributedIds.push(player.id)
        })
      })

      const uniqueDistributedIds = new Set(allDistributedIds)
      if (allDistributedIds.length !== uniqueDistributedIds.size) {
        alert("Có lỗi: Cầu thủ bị trùng giữa các đội. Vui lòng thử lại.")
        return
      }

      setTeams(newTeams)

      // Lưu đội vào Google Sheets
      try {
        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTeams),
        });
        
        if (response.ok) {
          console.log('Teams saved to Google Sheets successfully');
        } else {
          console.error('Failed to save teams to Google Sheets');
        }
      } catch (error) {
        console.error('Error saving teams to Google Sheets:', error);
      }

      await createMatchFromTeams(newTeams)
    } finally {
      setIsBalancing(false)
    }
  }

  const MAX_LOCAL_MATCHES = 50

  const sanitizePlayerForMatch = (player: Player): Player => ({
    id: player.id,
    name: player.name,
    position: player.position,
    skillPoints: player.skillPoints,
    createdAt: player.createdAt || Date.now(),
  })

  const sanitizeMatchForStorage = (match: any) => ({
    ...match,
    team1Players: match.team1Players?.map(sanitizePlayerForMatch),
    team2Players: match.team2Players?.map(sanitizePlayerForMatch),
  })

  const createMatchFromTeams = async (sourceTeams?: Team[]) => {
    const activeTeams = sourceTeams || teams

    if (activeTeams.length < 2) {
      alert("Cần ít nhất 2 đội để tạo trận đấu")
      return
    }

    // Chỉ tạo match cho 2 đội đầu tiên nếu có 3 đội
    const team1 = activeTeams[0]
    const team2 = activeTeams[1]

    const match = sanitizeMatchForStorage({
      id: Date.now().toString(),
      team1: team1.name,
      team2: team2.name,
      score1: 0,
      score2: 0,
      date: new Date().toISOString().split("T")[0],
      team1Players: team1.players,
      team2Players: team2.players,
      createdAt: Date.now(),
    })

    // Lưu match vào localStorage trước
    const existingMatches = JSON.parse(localStorage.getItem("football-matches") || "[]")
    const updatedMatches = [match, ...existingMatches].map(sanitizeMatchForStorage).slice(0, MAX_LOCAL_MATCHES)
    try {
      localStorage.setItem("football-matches", JSON.stringify(updatedMatches))
    } catch (error) {
      console.warn("Không thể lưu match vào localStorage:", error)
    }

    // Lưu vào Google Sheets
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(match),
      });

      if (response.ok) {
        // Chuyển sang trang matches
        router.push('/matches')
      } else {
        // Vẫn chuyển sang trang matches dù có lỗi
        router.push('/matches')
      }
    } catch (error) {
      console.error('Error creating match:', error);
      // Vẫn chuyển sang trang matches
      router.push('/matches')
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="mb-2 text-4xl font-black tracking-tight sm:text-5xl">
            CHIA ĐỘI TỰ ĐỘNG
          </h1>
          <p className="text-lg text-muted-foreground">
            Chọn cầu thủ và tự động sắp xếp đội hình cân bằng
          </p>
        </div>

        <div className="space-y-8">
          {/* Player Selection */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">Chọn cầu thủ</h2>
            {players.length > 0 && (
              <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="font-bold"
                >
                  {selectedPlayers.size === players.length ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Bỏ chọn tất cả
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Chọn tất cả
                    </>
                  )}
                </Button>
            )}
          </div>
          {isLoadingPlayers && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải danh sách cầu thủ, vui lòng đợi...</span>
            </div>
          )}
          {players.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Chưa có cầu thủ nào. Thêm cầu thủ trước.</p>
            </div>
            ) : (
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:bg-secondary"
                    onClick={() => togglePlayer(player.id)}
                  >
                    <Checkbox
                      checked={selectedPlayers.has(player.id)}
                      onCheckedChange={(checked) => {
                        if (checked !== undefined) {
                          togglePlayer(player.id)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="font-bold">{player.name}</div>
                      <div className="text-sm text-muted-foreground">{player.position}</div>
                    </div>
                    <div className="flex items-center gap-1 text-sm sm:text-base">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-bold">{player.skillPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">Số đội:</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant={numberOfTeams === 2 ? "default" : "outline"}
                    onClick={() => setNumberOfTeams(2)}
                    className="flex-1 font-bold"
                  >
                    2 Đội
                  </Button>
                  <Button
                    variant={numberOfTeams === 3 ? "default" : "outline"}
                    onClick={() => setNumberOfTeams(3)}
                    className="flex-1 font-bold"
                  >
                    3 Đội
                  </Button>
                </div>
              </div>
              <Button
                onClick={balanceTeams}
                disabled={selectedPlayers.size < numberOfTeams || isBalancing}
                className={`w-full font-bold text-white transition-all duration-300 shadow-lg shadow-primary/30 ${
                  isBalancing
                    ? "bg-gradient-to-r from-primary/60 to-green-500/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-green-500 hover:scale-[1.01]"
                }`}
                size="lg"
              >
                {isBalancing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang chia đội...
                  </>
                ) : (
                  <>
                    <Shuffle className="mr-2 h-5 w-5" />
                    Chia {numberOfTeams} đội ({selectedPlayers.size} cầu thủ)
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Teams Result */}
          {teams.length === 0 ? (
            <Card className="p-10 text-center">
              <Shuffle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-bold">Chưa chia đội</h3>
              <p className="text-muted-foreground">
                Chọn cầu thủ và nhấn &quot;Chia đội&quot; để bắt đầu
              </p>
            </Card>
          ) : (
            <div
              className={`grid gap-6 ${
                teams.length === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
              }`}
            >
              {teams.map((team, index) => (
                <Card key={index} className="p-5 sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-black">{team.name}</h2>
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 sm:px-4">
                      <Star className="h-5 w-5 text-primary" />
                      <span className="text-lg font-bold">{team.totalPoints} điểm</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {team.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex flex-col gap-2 rounded-lg bg-secondary p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="font-bold">{player.name}</div>
                          <div className="text-sm text-muted-foreground">{player.position}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-bold">{player.skillPoints}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {teams.length > 0 && (
            <>
              <Card className="border-primary/20 bg-primary/5 p-4">
                <div className="text-center space-y-1">
                  <p className="text-sm">
                    <span className="font-bold">Chênh lệch điểm tối đa:</span>{" "}
                    {(() => {
                      const points = teams.map(t => t.totalPoints)
                      const max = Math.max(...points)
                      const min = Math.min(...points)
                      return max - min
                    })()} điểm
                  </p>
                  {teams.length === 3 && (
                    <p className="text-xs text-muted-foreground">
                      Đội A: {teams[0].totalPoints} | Đội B: {teams[1].totalPoints} | Đội C: {teams[2].totalPoints}
                    </p>
                  )}
                </div>
              </Card>
              {teams.length >= 2 && (
                <Card className="p-5 sm:p-6">
                  <div className="space-y-4 text-center">
                    <div>
                      <h3 className="mb-2 text-xl font-bold">Sẵn sàng thi đấu!</h3>
                      <p className="text-sm text-muted-foreground">
                        Tạo trận đấu với đội hình đã chia. Bạn chỉ cần cập nhật tỉ số sau khi kết thúc trận đấu.
                      </p>
                    </div>
                    <Button
                      onClick={() => createMatchFromTeams()}
                      className="w-full font-bold"
                      size="lg"
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      Tạo trận đấu ({teams[0].name} vs {teams[1].name})
                    </Button>
                    {teams.length === 3 && (
                      <p className="text-xs text-muted-foreground">
                        Lưu ý: Chỉ tạo trận đấu cho 2 đội đầu tiên (Đội A vs Đội B)
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
