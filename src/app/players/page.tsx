"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Star, Trash2, User, RefreshCw, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  id: string;
  name: string;
  position: string;
  skillPoints: number;
  image?: string;
  createdAt: number;
}

type CropHandleMode =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const DEFAULT_SKILL_POINTS = 5;
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    skillPoints: DEFAULT_SKILL_POINTS,
    image: "",
  });
  const CROP_SIZE = 360;
  const MIN_CROP_SIZE = 120;
  const defaultCropBoxSize = CROP_SIZE * 0.75;
  const createCropperState = () => ({
    isOpen: false,
    src: "",
    zoom: 1,
    offset: { x: 0, y: 0 },
    imageWidth: 0,
    imageHeight: 0,
    baseScale: 1,
    mimeType: "image/jpeg",
    cropBox: {
      x: (CROP_SIZE - defaultCropBoxSize) / 2,
      y: (CROP_SIZE - defaultCropBoxSize) / 2,
      width: defaultCropBoxSize,
      height: defaultCropBoxSize,
    },
  });
  const [cropper, setCropper] = useState(createCropperState);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const cropBoxInteraction = useRef({
    active: false,
    mode: "move" as CropHandleMode,
    startX: 0,
    startY: 0,
    startBox: {
      x: (CROP_SIZE - defaultCropBoxSize) / 2,
      y: (CROP_SIZE - defaultCropBoxSize) / 2,
      width: defaultCropBoxSize,
      height: defaultCropBoxSize,
    },
  });
  const LOCAL_STORAGE_KEY = "football-players";

  const sanitizePlayersForStorage = useCallback(
    (items: Player[]) =>
      items.map((player) => ({
        ...player,
        image:
          player.image &&
          (player.image.startsWith("http://") ||
            player.image.startsWith("https://"))
            ? player.image
            : undefined,
      })),
    []
  );

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Player[]) : [];
    } catch (error) {
      console.error("Error reading players from localStorage:", error);
      return [];
    }
  };

  const saveToLocalStorage = useCallback(
    (items: Player[]) => {
      try {
        const safePlayers = sanitizePlayersForStorage(items);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safePlayers));
      } catch (error) {
        console.error("Error saving players to localStorage:", error);
      }
    },
    [LOCAL_STORAGE_KEY, sanitizePlayersForStorage]
  );

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/players");
        if (response.ok) {
          const playersData = await response.json();
          setPlayers(playersData);
          saveToLocalStorage(playersData);
        } else {
          // Fallback to localStorage if API fails
          const cachedPlayers = loadFromLocalStorage();
          if (cachedPlayers.length) setPlayers(cachedPlayers);
        }
      } catch (error) {
        console.error("Error loading players:", error);
        toast.error("Không thể tải danh sách cầu thủ");
        // Fallback to localStorage
        const cachedPlayers = loadFromLocalStorage();
        if (cachedPlayers.length) setPlayers(cachedPlayers);
      } finally {
        setIsLoading(false);
      }
    };

    // Load initially
    loadPlayers();
  }, [saveToLocalStorage]);

  const savePlayers = async (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    saveToLocalStorage(updatedPlayers);

    // Try to sync with Google Sheets
    try {
      // This will be called for individual player operations
    } catch (error) {
      console.error("Error syncing with Google Sheets:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropper({
        ...createCropperState(),
        isOpen: true,
        src: e.target?.result as string,
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const clampOffset = (value: number, dimension: number) => {
    if (dimension <= CROP_SIZE) {
      return (CROP_SIZE - dimension) / 2;
    }
    return Math.min(0, Math.max(CROP_SIZE - dimension, value));
  };

  const getDisplaySize = (zoomValue = cropper.zoom) => {
    const width = cropper.imageWidth * cropper.baseScale * zoomValue;
    const height = cropper.imageHeight * cropper.baseScale * zoomValue;
    return { width, height };
  };

  const handleCropImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const baseScale = Math.max(
      CROP_SIZE / naturalWidth,
      CROP_SIZE / naturalHeight
    );
    const width = naturalWidth * baseScale;
    const height = naturalHeight * baseScale;
    setCropper((prev) => ({
      ...prev,
      imageWidth: naturalWidth,
      imageHeight: naturalHeight,
      baseScale,
      offset: {
        x: (CROP_SIZE - width) / 2,
        y: (CROP_SIZE - height) / 2,
      },
    }));
  };

  const handleZoomChange = (value: number) => {
    setCropper((prev) => {
      const newZoom = value;
      const { width, height } = getDisplaySize(newZoom);
      return {
        ...prev,
        zoom: newZoom,
        offset: {
          x: clampOffset(prev.offset.x, width),
          y: clampOffset(prev.offset.y, height),
        },
      };
    });
  };

  const handleDragStart = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    const point = "touches" in event ? event.touches[0] : event;
    dragState.current = {
      active: true,
      startX: point.clientX,
      startY: point.clientY,
      originX: cropper.offset.x,
      originY: cropper.offset.y,
    };
    setIsDragging(true);
  };

  const handleDragMove = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!dragState.current.active) return;
    event.preventDefault();
    const point = "touches" in event ? event.touches[0] : event;
    const deltaX = point.clientX - dragState.current.startX;
    const deltaY = point.clientY - dragState.current.startY;
    const { width, height } = getDisplaySize();
    setCropper((prev) => ({
      ...prev,
      offset: {
        x: clampOffset(dragState.current.originX + deltaX, width),
        y: clampOffset(dragState.current.originY + deltaY, height),
      },
    }));
  };

  const handleDragEnd = useCallback(() => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    dragState.current.startX = 0;
    dragState.current.startY = 0;
    dragState.current.originX = 0;
    dragState.current.originY = 0;
    setIsDragging(false);
  }, []);

  const startCropBoxInteraction = (
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    mode: CropHandleMode
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const point = "touches" in event ? event.touches[0] : event;
    cropBoxInteraction.current = {
      active: true,
      mode,
      startX: point.clientX,
      startY: point.clientY,
      startBox: cropper.cropBox,
    };
    setIsDragging(true);
  };

  const updateCropBoxInteraction = (
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) => {
    if (!cropBoxInteraction.current.active) return;
    event.preventDefault();
    event.stopPropagation();
    const point = "touches" in event ? event.touches[0] : event;
    const deltaX = point.clientX - cropBoxInteraction.current.startX;
    const deltaY = point.clientY - cropBoxInteraction.current.startY;
    const { mode, startBox } = cropBoxInteraction.current;

    setCropper((prev) => {
      let { x, y, width, height } = startBox;

      if (mode === "move") {
        const nextX = clamp(x + deltaX, 0, CROP_SIZE - width);
        const nextY = clamp(y + deltaY, 0, CROP_SIZE - height);
        return { ...prev, cropBox: { ...prev.cropBox, x: nextX, y: nextY } };
      }

      let newX = x;
      let newY = y;
      let newWidth = width;
      let newHeight = height;

      if (mode.includes("e")) {
        newWidth = clamp(width + deltaX, MIN_CROP_SIZE, CROP_SIZE - newX);
      }
      if (mode.includes("s")) {
        newHeight = clamp(height + deltaY, MIN_CROP_SIZE, CROP_SIZE - newY);
      }
      if (mode.includes("w")) {
        newX = clamp(x + deltaX, 0, x + width - MIN_CROP_SIZE);
        newWidth = width + (x - newX);
      }
      if (mode.includes("n")) {
        newY = clamp(y + deltaY, 0, y + height - MIN_CROP_SIZE);
        newHeight = height + (y - newY);
      }

      return {
        ...prev,
        cropBox: {
          x: newX,
          y: newY,
          width: Math.min(CROP_SIZE - newX, Math.max(MIN_CROP_SIZE, newWidth)),
          height: Math.min(
            CROP_SIZE - newY,
            Math.max(MIN_CROP_SIZE, newHeight)
          ),
        },
      };
    });
  };

  const endCropBoxInteraction = useCallback(() => {
    if (!cropBoxInteraction.current.active) return;
    cropBoxInteraction.current.active = false;
    setIsDragging(false);
  }, []);

  const closeCropper = () => {
    dragState.current.active = false;
    cropBoxInteraction.current.active = false;
    setIsDragging(false);
    setCropper(createCropperState());
  };

  const applyCrop = () => {
    if (!cropper.src || !cropper.imageWidth || !cropper.imageHeight) return;

    const image = new window.Image();
    image.onload = () => {
      const scale = cropper.baseScale * cropper.zoom;
      const { cropBox, offset } = cropper;
      const sx = clamp((cropBox.x - offset.x) / scale, 0, cropper.imageWidth);
      const sy = clamp((cropBox.y - offset.y) / scale, 0, cropper.imageHeight);
      const sw = Math.min(cropBox.width / scale, cropper.imageWidth - sx);
      const sh = Math.min(cropBox.height / scale, cropper.imageHeight - sy);

      if (sw <= 0 || sh <= 0) return;

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const output = canvas.toDataURL(
        cropper.mimeType.includes("png") ? "image/png" : "image/jpeg",
        0.92
      );
      setNewPlayer((prev) => ({ ...prev, image: output }));
      closeCropper();
    };
    image.src = cropper.src;
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      handleDragEnd();
      endCropBoxInteraction();
    };
    window.addEventListener("mouseup", handleGlobalPointerUp);
    window.addEventListener("touchend", handleGlobalPointerUp);
    window.addEventListener("touchcancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalPointerUp);
      window.removeEventListener("touchend", handleGlobalPointerUp);
      window.removeEventListener("touchcancel", handleGlobalPointerUp);
    };
  }, [handleDragEnd, endCropBoxInteraction]);

  const addPlayer = async () => {
    if (!newPlayer.name || !newPlayer.position) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    toast.info(
      `Điểm kỹ năng của cầu thủ mới mặc định là ${DEFAULT_SKILL_POINTS}`
    );

    const player: Player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      position: newPlayer.position,
      skillPoints: DEFAULT_SKILL_POINTS,
      image: newPlayer.image,
      createdAt: Date.now(),
    };

    // Save to Google Sheets
    try {
      const toastId = toast.loading("Đang thêm cầu thủ...");
      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(player),
      });

      if (response.ok) {
        // Update local state
        setPlayers([...players, player]);
        setNewPlayer({
          name: "",
          position: "",
          skillPoints: DEFAULT_SKILL_POINTS,
          image: "",
        });
        setIsOpen(false);
        toast.success(`Đã thêm cầu thủ ${player.name} thành công!`, {
          id: toastId,
        });
      } else {
        // Fallback to localStorage
        savePlayers([...players, player]);
        setNewPlayer({
          name: "",
          position: "",
          skillPoints: DEFAULT_SKILL_POINTS,
          image: "",
        });
        setIsOpen(false);
        toast.success(`Đã thêm cầu thủ ${player.name} (lưu tạm)`, {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error saving player:", error);
      toast.error("Không thể thêm cầu thủ");
      // Fallback to localStorage
      savePlayers([...players, player]);
      setNewPlayer({
        name: "",
        position: "",
        skillPoints: DEFAULT_SKILL_POINTS,
        image: "",
      });
      setIsOpen(false);
    }
  };

  const deletePlayer = async (id: string) => {
    const player = players.find((p) => p.id === id);
    if (!player) return;

    if (!confirm(`Bạn có chắc muốn xóa cầu thủ ${player.name}?`)) {
      return;
    }

    try {
      const toastId = toast.loading("Đang xóa cầu thủ...");
      const response = await fetch(`/api/players?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state
        const updatedPlayers = players.filter((p) => p.id !== id);
        setPlayers(updatedPlayers);
        saveToLocalStorage(updatedPlayers);
        toast.success(`Đã xóa cầu thủ ${player.name}`, { id: toastId });
        // Reload from Google Sheets to ensure sync
        const reloadResponse = await fetch("/api/players");
        if (reloadResponse.ok) {
          const playersData = await reloadResponse.json();
          setPlayers(playersData);
          saveToLocalStorage(playersData);
        }
      } else {
        // Fallback to localStorage
        const updatedPlayers = players.filter((p) => p.id !== id);
        setPlayers(updatedPlayers);
        saveToLocalStorage(updatedPlayers);
        toast.success(`Đã xóa cầu thủ ${player.name} (lưu tạm)`, {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error("Không thể xóa cầu thủ");
      // Fallback to localStorage
      const updatedPlayers = players.filter((p) => p.id !== id);
      setPlayers(updatedPlayers);
      saveToLocalStorage(updatedPlayers);
    }
  };

  const refreshPlayers = async () => {
    try {
      const toastId = toast.loading("Đang làm mới...");
      const response = await fetch("/api/players");
      if (response.ok) {
        const playersData = await response.json();
        setPlayers(playersData);
        saveToLocalStorage(playersData);
        toast.success("Đã làm mới danh sách cầu thủ", { id: toastId });
      } else {
        toast.error("Không thể làm mới danh sách", { id: toastId });
      }
    } catch (error) {
      console.error("Error refreshing players:", error);
      toast.error("Không thể làm mới danh sách");
    }
  };

  const cropHandles: Array<{
    key: CropHandleMode;
    style: React.CSSProperties;
    cursor: string;
  }> = [
    {
      key: "n",
      style: { top: 0, left: "50%", transform: "translate(-50%, -50%)" },
      cursor: "ns-resize",
    },
    {
      key: "s",
      style: { bottom: 0, left: "50%", transform: "translate(-50%, 50%)" },
      cursor: "ns-resize",
    },
    {
      key: "e",
      style: { right: 0, top: "50%", transform: "translate(50%, -50%)" },
      cursor: "ew-resize",
    },
    {
      key: "w",
      style: { left: 0, top: "50%", transform: "translate(-50%, -50%)" },
      cursor: "ew-resize",
    },
    {
      key: "ne",
      style: { right: 0, top: 0, transform: "translate(50%, -50%)" },
      cursor: "nesw-resize",
    },
    {
      key: "nw",
      style: { left: 0, top: 0, transform: "translate(-50%, -50%)" },
      cursor: "nwse-resize",
    },
    {
      key: "se",
      style: { right: 0, bottom: 0, transform: "translate(50%, 50%)" },
      cursor: "nwse-resize",
    },
    {
      key: "sw",
      style: { left: 0, bottom: 0, transform: "translate(-50%, 50%)" },
      cursor: "nesw-resize",
    },
  ];

  const previewSize = getDisplaySize();
  const previewWidth = Math.max(
    1,
    Math.round((previewSize.width || CROP_SIZE) ?? CROP_SIZE)
  );

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              QUẢN LÝ CẦU THỦ
            </h1>
            <p className="text-muted-foreground text-lg">
              Thêm cầu thủ mới (điểm kỹ năng chỉ thay đổi theo kết quả trận đấu)
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-sm font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Tổng số cầu thủ trong hệ thống:{" "}
              <span className="font-black text-primary">
                {players.length.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-bold transition-transform hover:scale-105 sm:w-auto"
              onClick={refreshPlayers}
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
              Thêm cầu thủ
            </Button>
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
                  <h2 className="text-2xl font-bold">Thêm cầu thủ mới</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Tên cầu thủ</Label>
                    <Input
                      className="text-black"
                      id="name"
                      value={newPlayer.name}
                      onChange={(e) =>
                        setNewPlayer({ ...newPlayer, name: e.target.value })
                      }
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Vị trí</Label>
                    <select
                      id="position"
                      value={newPlayer.position}
                      onChange={(e) =>
                        setNewPlayer({ ...newPlayer, position: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-black shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    >
                      <option value="" disabled>
                        -- Chọn vị trí --
                      </option>
                      <option value="ST">ST</option>
                      <option value="CM">CM</option>
                      <option value="CB">CB</option>
                      <option value="GK">GK</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="skillPoints">
                      Điểm kỹ năng mặc định: {DEFAULT_SKILL_POINTS}
                    </Label>
                    <Input
                      id="skillPoints"
                      type="range"
                      min={DEFAULT_SKILL_POINTS}
                      max={DEFAULT_SKILL_POINTS}
                      value={DEFAULT_SKILL_POINTS}
                      readOnly
                      disabled
                      className="cursor-not-allowed opacity-70"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Điểm kỹ năng ban đầu luôn cố định ở {DEFAULT_SKILL_POINTS}{" "}
                      và chỉ thay đổi theo kết quả trận đấu.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="image">Ảnh cầu thủ</Label>
                    <div className="space-y-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                      {newPlayer.image &&
                        (newPlayer.image.startsWith("data:") ||
                          newPlayer.image.startsWith("http://") ||
                          newPlayer.image.startsWith("https://")) && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2"
                          >
                            <Image
                              src={newPlayer.image}
                              alt="Preview"
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg border"
                              unoptimized={newPlayer.image.startsWith("data:")}
                              loading="lazy"
                            />
                          </motion.div>
                        )}
                    </div>
                  </div>
                  <Button
                    onClick={addPlayer}
                    className="w-full font-bold gradient-primary hover:scale-105 transition-transform shadow-lg"
                  >
                    Thêm cầu thủ
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cropper.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeCropper}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="relative z-50 w-full max-w-2xl mx-4 rounded-2xl border bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Chỉnh sửa ảnh đại diện</h2>
                  <button
                    onClick={closeCropper}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40 shadow-inner ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                      }`}
                      style={{ width: CROP_SIZE, height: CROP_SIZE }}
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onTouchStart={handleDragStart}
                      onTouchMove={handleDragMove}
                    >
                      {cropper.src && (
                        <>
                          <div
                            className="absolute select-none will-change-transform"
                            style={{
                              width: `${previewSize.width}px`,
                              height: `${previewSize.height}px`,
                              left: `${cropper.offset.x}px`,
                              top: `${cropper.offset.y}px`,
                              userSelect: "none",
                              pointerEvents: "none",
                            }}
                          >
                            <Image
                              src={cropper.src}
                              alt="Xem trước ảnh"
                              fill
                              sizes={`${previewWidth}px`}
                              onLoad={handleCropImageLoad}
                              draggable={false}
                              unoptimized
                              style={{
                                objectFit: "cover",
                                userSelect: "none",
                              }}
                            />
                          </div>
                          <div
                            className="absolute border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-[box-shadow]"
                            style={{
                              left: `${cropper.cropBox.x}px`,
                              top: `${cropper.cropBox.y}px`,
                              width: `${cropper.cropBox.width}px`,
                              height: `${cropper.cropBox.height}px`,
                              cursor: isDragging ? "grabbing" : "move",
                              borderRadius: "24px",
                            }}
                            onMouseDown={(e) =>
                              startCropBoxInteraction(e, "move")
                            }
                            onTouchStart={(e) =>
                              startCropBoxInteraction(e, "move")
                            }
                            onMouseMove={updateCropBoxInteraction}
                            onTouchMove={updateCropBoxInteraction}
                            onMouseUp={endCropBoxInteraction}
                            onTouchEnd={endCropBoxInteraction}
                          >
                            <div className="pointer-events-none absolute inset-0">
                              <span className="absolute inset-y-0 left-1/3 border-l border-white/40" />
                              <span className="absolute inset-y-0 left-2/3 border-l border-white/40" />
                              <span className="absolute inset-x-0 top-1/3 border-t border-white/40" />
                              <span className="absolute inset-x-0 top-2/3 border-t border-white/40" />
                            </div>
                            {cropHandles.map((handle) => (
                              <span
                                key={handle.key}
                                className="absolute h-3 w-3 rounded-full border border-black/70 bg-white shadow"
                                style={{
                                  ...handle.style,
                                  cursor: handle.cursor,
                                }}
                                onMouseDown={(e) =>
                                  startCropBoxInteraction(e, handle.key)
                                }
                                onTouchStart={(e) =>
                                  startCropBoxInteraction(e, handle.key)
                                }
                                onMouseMove={updateCropBoxInteraction}
                                onTouchMove={updateCropBoxInteraction}
                                onMouseUp={endCropBoxInteraction}
                                onTouchEnd={endCropBoxInteraction}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Kéo ảnh để canh khung, kéo khung trắng để di chuyển/thay
                      đổi kích thước và dùng thanh trượt để phóng to.
                    </p>
                  </div>
                  <div>
                    <Label>Thu phóng</Label>
                    <input
                      type="range"
                      min={1}
                      max={2.5}
                      step={0.05}
                      value={cropper.zoom}
                      onChange={(e) => handleZoomChange(Number(e.target.value))}
                      className="mt-2 w-full accent-primary"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeCropper}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="flex-1 gradient-primary font-semibold"
                      onClick={applyCrop}
                    >
                      Sử dụng ảnh
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : players.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 text-center gradient-card border">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Chưa có cầu thủ nào</h3>
              <p className="text-muted-foreground">
                Thêm cầu thủ đầu tiên để bắt đầu
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {players.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  index={index}
                  onDelete={() => deletePlayer(player.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: Player;
  index: number;
  onDelete: () => void;
}

const PlayerCard = ({ player, index, onDelete }: PlayerCardProps) => {
  const formattedSkill = player.skillPoints.toString().padStart(2, "0");
  const hasImage =
    player.image &&
    (player.image.startsWith("data:") ||
      player.image.startsWith("http://") ||
      player.image.startsWith("https://"));
  const positionLabel = player.position || "N/A";
  const skillColorClass =
    player.skillPoints <= 4
      ? "text-red-400"
      : player.skillPoints === 5
      ? "text-[#f6b13e]"
      : player.skillPoints <= 8
      ? "text-green-400"
      : "text-[#d0f0ff]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex justify-center"
    >
      <div className="relative w-full max-w-[320px] aspect-[3/5] drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)]">
        <Image
          src="/background3.png"
          alt="Nền thẻ cầu thủ"
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 45vw, 100vw"
          className="rounded-[32px] object-cover object-top"
          priority={false}
        />
        <div className="absolute inset-0 z-10 flex flex-col px-5 py-6 text-[#fbeed3]">
          <div className="flex flex-col items-center gap-4 text-xs font-semibold tracking-[0.35em] uppercase text-[#fddc9a] sm:flex-row sm:justify-between ">
            <div className="flex flex-col items-center text-center gap-2 sm:items-start">
              
              <Image
                src="/FWF%20FC@4x.png"
                alt="logo câu lạc bộ"
                width={88}
                height={88}
                className="h-10 w-16 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)] sm:h-20 sm:w-20"
                priority={false}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-9 w-9 rounded-full bg-black/30 hover:bg-destructive/40 text-[#fddc9a] hover:text-white transition-colors self-end sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className=" flex w-full flex-col items-center gap-4 -mt-0 sm:mt-2">
            <div className="h-32 w-32 rounded-full bg-black/50 shadow-[0_12px_30px_rgba(0,0,0,0.55)] overflow-hidden sm:h-32 sm:w-32 ml-7">
              {hasImage ? (
                <Image
                  src={player.image as string}
                  alt={player.name}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                  unoptimized={player.image?.startsWith("data:")}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#a17a3f] to-[#5d3b1a]">
                  <User className="w-14 h-14 text-white/70" />
                </div>
              )}
            </div>
            <div className="flex w-full justify-center">
              <p className="w-full rounded-md py-2 text-center text-lg font-black uppercase tracking-[0.2em] text-[#ffe9c5] sm:text-xl ml-8">
                {player.name}
              </p>
            </div>
          </div>

          <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase text-[#ffe8b8]">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs">
              <Star className="w-3 h-3 fill-[#ffd477] text-[#ffd477]" />
              Chỉ số
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 pt-6 text-center">
            <div>
              <div
                className={`text-5xl font-black leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)] sm:text-6xl ${skillColorClass}`}
              >
                {formattedSkill}
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ffe8b8]">
                {positionLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
