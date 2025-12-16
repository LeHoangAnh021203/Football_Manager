"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare } from "lucide-react"

interface Message {
  id: string
  username: string
  text: string
  timestamp: number
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [username, setUsername] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isUsernameSet, setIsUsernameSet] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("football-messages")
    if (stored) {
      setMessages(JSON.parse(stored))
    }
    const storedUsername = localStorage.getItem("football-username")
    if (storedUsername) {
      setUsername(storedUsername)
      setIsUsernameSet(true)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const saveMessages = (updatedMessages: Message[]) => {
    setMessages(updatedMessages)
    localStorage.setItem("football-messages", JSON.stringify(updatedMessages))
  }

  const setUsernameHandler = () => {
    if (!username.trim()) return
    localStorage.setItem("football-username", username)
    setIsUsernameSet(true)
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      username,
      text: newMessage,
      timestamp: Date.now(),
    }

    saveMessages([...messages, message])
    setNewMessage("")
  }

  if (!isUsernameSet) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-3xl font-black mb-6 text-center">NHẬP TÊN CỦA BẠN</h1>
          <div className="space-y-4">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên của bạn"
              onKeyDown={(e) => e.key === "Enter" && setUsernameHandler()}
              className="text-black"
            />
            <Button onClick={setUsernameHandler} className="w-full font-bold" size="lg">
              Bắt đầu chat
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="mb-2 text-4xl font-black tracking-tight sm:text-5xl">
            NHẮN TIN
          </h1>
          <p className="text-lg text-muted-foreground">
            Đang chat với tên: <span className="font-bold">{username}</span>
          </p>
        </div>

        <Card className="flex h-[70vh] flex-col sm:h-[calc(100vh-16rem)]">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-bold">Chưa có tin nhắn</h3>
                <p className="text-muted-foreground">
                  Gửi tin nhắn đầu tiên để bắt đầu
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.username === username ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] ${
                      message.username === username
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    } rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{message.username}</span>
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-pretty ">{message.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="text-base text-black"
              />
              <Button
                onClick={sendMessage}
                className="w-full gap-2 font-bold sm:w-auto sm:gap-0"
                size="lg"
              >
                <Send className="h-4 w-4" />
                <span className="sm:hidden">Gửi</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
