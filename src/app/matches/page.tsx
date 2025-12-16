"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trophy, Trash2, Users, ChevronDown, ChevronUp, RefreshCw, Edit2, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface Player {
  id: string
  name: string
  position: string
  skillPoints: number
  image?: string
  createdAt: number
}

interface Team {
  name: string
  players: Player[]
  totalPoints: number
}

interface Match {
  id: string
  team1: string
  team2: string
  score1: number
  score2: number
  date: string
  team1Players?: Player[]
  team2Players?: Player[]
  createdAt: number
}

const MAX_LOCAL_MATCHES = 50

const sanitizePlayerForMatch = (player: Player): Player => ({
  id: player.id,
  name: player.name,
  position: player.position,
  skillPoints: player.skillPoints,
  image: undefined,
  createdAt: player.createdAt || Date.now(),
})

const sanitizeMatch = (match: Match): Match => ({
  ...match,
  team1Players: match.team1Players?.map(sanitizePlayerForMatch),
  team2Players: match.team2Players?.map(sanitizePlayerForMatch),
})

const persistMatches = (matchesToPersist: Match[]) => {
  try {
    const sanitized = matchesToPersist.map(sanitizeMatch).slice(0, MAX_LOCAL_MATCHES)
    localStorage.setItem("football-matches", JSON.stringify(sanitized))
  } catch (error) {
    console.warn("Không thể lưu danh sách trận đấu vào localStorage:", error)
  }
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [editScore, setEditScore] = useState({ score1: 0, score2: 0 })
  const [newMatch, setNewMatch] = useState({
    team1: "",
    team2: "",
    score1: 0,
    score2: 0,
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        if (response.ok) {
          const matchesData: Match[] = await response.json();
          const sanitizedData = matchesData.map(sanitizeMatch)
          setMatches(sanitizedData);
          // Sync to localStorage as backup
          persistMatches(sanitizedData);
        } else {
          // Fallback to localStorage if API fails
          const stored = localStorage.getItem("football-matches");
          if (stored) {
            setMatches(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error('Error loading matches:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem("football-matches");
        if (stored) {
          setMatches(JSON.parse(stored));
        }
      }
    };
    
    // Load initially
    loadMatches();
    
    // Auto-sync every 30 seconds from Google Sheets
    const syncInterval = setInterval(() => {
      loadMatches();
    }, 30000); // 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(syncInterval);
  }, [])

  const saveMatches = (updatedMatches: Match[]) => {
    const sanitized = updatedMatches.map(sanitizeMatch)
    setMatches(sanitized)
    persistMatches(sanitized)
  }

  const addMatch = async () => {
    if (!newMatch.team1 || !newMatch.team2) return

    const match: Match = {
      id: Date.now().toString(),
      team1: newMatch.team1,
      team2: newMatch.team2,
      score1: newMatch.score1,
      score2: newMatch.score2,
      date: newMatch.date,
      createdAt: Date.now(),
    }

    // Save to Google Sheets
    try {
      const sanitizedMatch = sanitizeMatch(match)
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedMatch),
      });
      
      if (response.ok) {
        // Update local state
        saveMatches([match, ...matches]);
        setNewMatch({
          team1: "",
          team2: "",
          score1: 0,
          score2: 0,
          date: new Date().toISOString().split("T")[0],
        });
        setIsOpen(false);
        // Reload from Google Sheets to ensure sync
        const reloadResponse = await fetch('/api/matches');
        if (reloadResponse.ok) {
        const matchesData: Match[] = await reloadResponse.json();
        const sanitizedData = matchesData.map(sanitizeMatch);
        setMatches(sanitizedData);
        persistMatches(sanitizedData);
        }
      } else {
        // Fallback to localStorage
        saveMatches([match, ...matches]);
        setNewMatch({
          team1: "",
          team2: "",
          score1: 0,
          score2: 0,
          date: new Date().toISOString().split("T")[0],
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error saving match:', error);
      // Fallback to localStorage
      saveMatches([match, ...matches]);
      setNewMatch({
        team1: "",
        team2: "",
        score1: 0,
        score2: 0,
        date: new Date().toISOString().split("T")[0],
      });
      setIsOpen(false);
    }
  }

  const deleteMatch = async (id: string) => {
    const match = matches.find(m => m.id === id);
    if (!match) return;

    if (!confirm(`Bạn có chắc muốn xóa trận đấu ${match.team1} vs ${match.team2}?`)) {
      return;
    }

    try {
      const toastId = toast.loading('Đang xóa trận đấu...');
      const response = await fetch(`/api/matches?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Update local state
        const updatedMatches = matches.filter((m) => m.id !== id);
        const sanitizedUpdated = updatedMatches.map(sanitizeMatch)
        setMatches(sanitizedUpdated);
        persistMatches(sanitizedUpdated);
        toast.success('Đã xóa trận đấu', { id: toastId });
        // Reload from Google Sheets to ensure sync
        const reloadResponse = await fetch('/api/matches');
        if (reloadResponse.ok) {
          const matchesData: Match[] = await reloadResponse.json();
          const sanitizedData = matchesData.map(sanitizeMatch);
          setMatches(sanitizedData);
          persistMatches(sanitizedData);
        }
      } else {
        // Fallback to localStorage
        const updatedMatches = matches.filter((m) => m.id !== id);
        const sanitizedUpdated = updatedMatches.map(sanitizeMatch)
        setMatches(sanitizedUpdated);
        persistMatches(sanitizedUpdated);
        toast.success('Đã xóa trận đấu (lưu tạm)', { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('Không thể xóa trận đấu');
      // Fallback to localStorage
      const updatedMatches = matches.filter((m) => m.id !== id);
      const sanitizedUpdated = updatedMatches.map(sanitizeMatch)
      setMatches(sanitizedUpdated);
      persistMatches(sanitizedUpdated);
    }
  }

  const refreshMatches = async () => {
    try {
      const toastId = toast.loading('Đang làm mới...');
      const response = await fetch('/api/matches');
      if (response.ok) {
        const matchesData: Match[] = await response.json();
        const sanitizedData = matchesData.map(sanitizeMatch);
        setMatches(sanitizedData);
        persistMatches(sanitizedData);
        toast.success('Đã làm mới danh sách trận đấu', { id: toastId });
      } else {
        toast.error('Không thể làm mới danh sách', { id: toastId });
      }
    } catch (error) {
      console.error('Error refreshing matches:', error);
      toast.error('Không thể làm mới danh sách');
    }
  }

  const startEditingScore = (match: Match) => {
    setEditingScore(match.id)
    setEditScore({ score1: match.score1, score2: match.score2 })
  }

  const cancelEditingScore = () => {
    setEditingScore(null)
    setEditScore({ score1: 0, score2: 0 })
  }

  const updatePlayerSkillPoints = async (playerIds: string[], pointsChange: number) => {
    if (playerIds.length === 0 || pointsChange === 0) return

    try {
      // Lấy danh sách players hiện tại
      const playersResponse = await fetch('/api/players')
      if (!playersResponse.ok) {
        console.error('Failed to fetch players')
        return
      }

      const allPlayers: Player[] = await playersResponse.json()
      console.log(`📋 Tìm thấy ${allPlayers.length} cầu thủ trong hệ thống`)
      console.log(`📋 Player IDs cần cập nhật:`, playerIds)
      console.log(`📋 Player IDs có trong hệ thống:`, allPlayers.map(p => ({ id: p.id, name: p.name })))
      
      // Cập nhật điểm cho từng player
      const updatePromises = playerIds.map(async (playerId) => {
        const player = allPlayers.find(p => p.id === playerId)
        if (!player) {
          console.warn(`⚠️ Không tìm thấy cầu thủ với ID: ${playerId}`)
          return false
        }

        // Giới hạn điểm trong khoảng 1-10
        const newSkillPoints = Math.max(1, Math.min(10, player.skillPoints + pointsChange))
        
        // Chỉ cập nhật nếu có thay đổi
        if (newSkillPoints === player.skillPoints) {
          console.log(`⏭️ Cầu thủ ${player.name} đã đạt giới hạn điểm (${player.skillPoints}), bỏ qua`)
          return true
        }

        // Đảm bảo player có đầy đủ dữ liệu
        const updatedPlayer: Player = {
          id: player.id,
          name: player.name || '',
          position: player.position || '',
          skillPoints: newSkillPoints,
          image: player.image || '',
          createdAt: player.createdAt || Date.now(),
        }

        console.log(`📝 Cập nhật ${player.name}: ${player.skillPoints} → ${newSkillPoints} (${pointsChange > 0 ? '+' : ''}${pointsChange})`)

        // Cập nhật player
        try {
          const response = await fetch('/api/players', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPlayer),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.error(`❌ Không thể cập nhật ${player.name} (ID: ${player.id}):`, errorData)
            if (errorData.details?.searchedIds) {
              console.error(`   IDs có trong sheet:`, errorData.details.searchedIds)
            }
            return false
          }

          console.log(`✅ Đã cập nhật điểm cho ${player.name}`)
          return true
        } catch (error: any) {
          console.error(`❌ Lỗi khi cập nhật ${player.name}:`, error.message)
          return false
        }
      })

      const results = await Promise.all(updatePromises)
      const successCount = results.filter(r => r === true).length
      console.log(`✅ Đã cập nhật điểm cho ${successCount}/${playerIds.length} cầu thủ (${pointsChange > 0 ? '+' : ''}${pointsChange} điểm)`)
      return successCount
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật điểm kỹ năng:', error)
      return 0
    }
  }

  const updateScore = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId)
    if (!match) return

    const oldScore1 = match.score1
    const oldScore2 = match.score2
    const newScore1 = editScore.score1
    const newScore2 = editScore.score2

    const updatedMatch: Match = {
      ...match,
      score1: newScore1,
      score2: newScore2,
    }

    // Xác định kết quả trận đấu
    const oldWinner = oldScore1 > oldScore2 ? 1 : oldScore1 < oldScore2 ? 2 : 0
    const newWinner = newScore1 > newScore2 ? 1 : newScore1 < newScore2 ? 2 : 0

    // Update local state immediately
    const sanitizedMatch = sanitizeMatch(updatedMatch)
    const updatedMatches = matches.map(m => m.id === matchId ? sanitizedMatch : m)
    setMatches(updatedMatches)
    persistMatches(updatedMatches)

    // Save to Google Sheets
    try {
      const toastId = toast.loading('Đang cập nhật tỉ số...');
      const response = await fetch('/api/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedMatch),
      });

      if (response.ok) {
        setEditingScore(null)
        toast.success('Đã cập nhật tỉ số thành công!', { id: toastId });
        
        // Cập nhật điểm kỹ năng cho cầu thủ dựa trên kết quả trận đấu
        if (match.team1Players && match.team2Players && match.team1Players.length > 0 && match.team2Players.length > 0) {
          const team1PlayerIds = match.team1Players.map(p => p.id)
          const team2PlayerIds = match.team2Players.map(p => p.id)
          let pointsUpdated = false

          // Xử lý cập nhật điểm
          if (oldWinner !== newWinner) {
            // Có thay đổi kết quả: hoàn lại điểm cũ và áp dụng điểm mới
            if (oldWinner === 1) {
              await updatePlayerSkillPoints(team1PlayerIds, -1)
              await updatePlayerSkillPoints(team2PlayerIds, 1)
              pointsUpdated = true
            } else if (oldWinner === 2) {
              await updatePlayerSkillPoints(team2PlayerIds, -1)
              await updatePlayerSkillPoints(team1PlayerIds, 1)
              pointsUpdated = true
            }

            // Áp dụng điểm cho kết quả mới
            if (newWinner === 1) {
              await updatePlayerSkillPoints(team1PlayerIds, 1)
              await updatePlayerSkillPoints(team2PlayerIds, -1)
              pointsUpdated = true
            } else if (newWinner === 2) {
              await updatePlayerSkillPoints(team2PlayerIds, 1)
              await updatePlayerSkillPoints(team1PlayerIds, -1)
              pointsUpdated = true
            }
          } else if (oldWinner === 0 && newWinner !== 0) {
            // Lần đầu cập nhật từ 0-0
            if (newWinner === 1) {
              await updatePlayerSkillPoints(team1PlayerIds, 1)
              await updatePlayerSkillPoints(team2PlayerIds, -1)
              pointsUpdated = true
            } else if (newWinner === 2) {
              await updatePlayerSkillPoints(team2PlayerIds, 1)
              await updatePlayerSkillPoints(team1PlayerIds, -1)
              pointsUpdated = true
            }
          }

          if (pointsUpdated) {
            // Thông báo cho người dùng
            const winnerTeam = newWinner === 1 ? match.team1 : newWinner === 2 ? match.team2 : null
            const loserTeam = newWinner === 1 ? match.team2 : newWinner === 2 ? match.team1 : null
            if (winnerTeam && loserTeam) {
              toast.success(
                `${winnerTeam} thắng: +1 điểm\n${loserTeam} thua: -1 điểm`,
                { duration: 5000 }
              )
            }
          } else {
            toast.info('Không có thay đổi kết quả, không cần cập nhật điểm')
          }
        } else {
          toast.warning('Match không có danh sách cầu thủ. Tạo match từ "Chia đội" để có danh sách cầu thủ.', { duration: 5000 })
        }

        // Reload from Google Sheets to ensure sync
        const reloadResponse = await fetch('/api/matches');
        if (reloadResponse.ok) {
          const matchesData: Match[] = await reloadResponse.json();
          const sanitizedData = matchesData.map(sanitizeMatch);
          setMatches(sanitizedData);
          persistMatches(sanitizedData);
        }
      } else {
        // Revert on error
        setMatches(matches)
        persistMatches(matches)
        toast.error('Không thể cập nhật tỉ số. Vui lòng thử lại.', { id: toastId })
      }
    } catch (error) {
      console.error('Error updating score:', error);
      // Revert on error
      setMatches(matches)
      persistMatches(matches)
      toast.error('Không thể cập nhật tỉ số. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 pb-28 animate-fade-in sm:pb-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="rounded-2xl border border-primary/10 bg-card/60 p-6 text-center shadow-lg backdrop-blur md:flex md:items-center md:justify-between md:text-left">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent sm:text-4xl">
                KẾT QUẢ TRẬN ĐẤU
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">Cập nhật và theo dõi các trận đấu mới nhất</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:flex-wrap md:justify-end">
              <Button
                size="lg"
                variant="outline"
                className="w-full font-bold hover:scale-105 transition-transform sm:w-auto"
                onClick={refreshMatches}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Làm mới
              </Button>
              <Button
                size="lg"
                className="w-full font-bold gradient-primary hover:scale-105 transition-transform shadow-lg sm:w-auto"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Thêm trận đấu
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="relative z-50 gradient-card border rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl"
              >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Thêm kết quả trận đấu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team1">Đội 1</Label>
                  <Input
                    id="team1"
                    value={newMatch.team1}
                    onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })}
                    placeholder="Tên đội 1"
                    className="text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="team2">Đội 2</Label>
                  <Input
                    id="team2"
                    value={newMatch.team2}
                    onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })}
                    placeholder="Tên đội 2"
                    className="text-black"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="score1">Tỷ số đội 1</Label>
                    <Input
                    className="text-black"
                      id="score1"
                      type="number"
                      min="0"
                      value={newMatch.score1}
                      onChange={(e) =>
                        setNewMatch({
                          ...newMatch,
                          score1: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="score2">Tỷ số đội 2</Label>
                    <Input
                    className="text-black"
                      id="score2"
                      type="number"
                      min="0"
                      value={newMatch.score2}
                      onChange={(e) =>
                        setNewMatch({
                          ...newMatch,
                          score2: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Ngày thi đấu</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                    className="text-black"
                  />
                </div>
                <Button 
                  onClick={addMatch} 
                  className="w-full font-bold gradient-primary hover:scale-105 transition-transform shadow-lg"
                >
                  Thêm trận đấu
                </Button>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 text-center gradient-card border">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Chưa có trận đấu nào</h3>
              <p className="text-muted-foreground">Thêm kết quả trận đấu đầu tiên</p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {matches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-6 rounded-2xl border border-primary/10 bg-card/70 shadow-lg transition-all duration-300 hover:border-primary/40">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(match.date).toLocaleDateString("vi-VN")}
                        </span>
                        <div className="flex items-center gap-2">
                          {(match.team1Players || match.team2Players) && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            {expandedMatch === match.id ? "Ẩn đội hình" : "Xem đội hình"}
                            {expandedMatch === match.id ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteMatch(match.id)}
                          className="hover:bg-destructive/20 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                      <div className="flex w-full flex-1 flex-col items-center text-center sm:items-end sm:text-right">
                        <h3 className="text-2xl font-bold">{match.team1}</h3>
                        {match.team1Players && (
                          <p className="text-sm text-muted-foreground">
                            {match.team1Players.length} cầu thủ
                          </p>
                        )}
                      </div>
                      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-primary/20 bg-card/80 px-6 py-4 sm:w-auto sm:flex-row sm:gap-4 sm:px-8">
                        {editingScore === match.id ? (
                          <div className="flex items-center gap-2 flex-wrap justify-center">
                            <Input
                              type="number"
                              min="0"
                              value={editScore.score1}
                              onChange={(e) => setEditScore({ ...editScore, score1: Number.parseInt(e.target.value) || 0 })}
                              className="w-16 text-center text-2xl font-black text-black"
                              autoFocus
                            />
                            <span className="text-2xl text-muted-foreground">-</span>
                            <Input
                              type="number"
                              min="0"
                              value={editScore.score2}
                              onChange={(e) => setEditScore({ ...editScore, score2: Number.parseInt(e.target.value) || 0 })}
                              className="w-16 text-center text-2xl font-black text-black"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => updateScore(match.id)}
                              className="h-8 w-8"
                            >
                              <Check className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelEditingScore}
                              className="h-8 w-8"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="text-4xl font-black">{match.score1}</span>
                            <span className="text-2xl text-muted-foreground">-</span>
                            <span className="text-4xl font-black">{match.score2}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditingScore(match)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Cập nhật tỉ số"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex w-full flex-1 flex-col items-center text-center sm:items-start sm:text-left">
                        <h3 className="text-2xl font-bold">{match.team2}</h3>
                        {match.team2Players && (
                          <p className="text-sm text-muted-foreground">
                            {match.team2Players.length} cầu thủ
                          </p>
                        )}
                      </div>
                    </div>
                    </div>
                    
                    {/* Hiển thị danh sách cầu thủ khi mở rộng */}
                    <AnimatePresence>
                      {expandedMatch === match.id && (match.team1Players || match.team2Players) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 grid md:grid-cols-2 gap-6"
                        >
                        {match.team1Players && (
                          <div>
                            <h4 className="font-bold mb-3 text-primary">{match.team1}</h4>
                            <div className="space-y-2">
                              {match.team1Players.map((player) => (
                                <div key={player.id} className="flex items-center gap-3 p-2 bg-secondary rounded-lg">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-bold">{player.skillPoints}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{player.name}</p>
                                    <p className="text-xs text-muted-foreground">{player.position}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {match.team2Players && (
                          <div>
                            <h4 className="font-bold mb-3 text-primary">{match.team2}</h4>
                            <div className="space-y-2">
                              {match.team2Players.map((player) => (
                                <div key={player.id} className="flex items-center gap-3 p-2 bg-secondary rounded-lg">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-bold">{player.skillPoints}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{player.name}</p>
                                    <p className="text-xs text-muted-foreground">{player.position}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
