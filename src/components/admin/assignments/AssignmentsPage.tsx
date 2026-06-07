/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/assignments/AssignmentsPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAssignments } from "@/hooks/useAssignments";
import { AssignmentModal } from "./AssignmentModal";
import { AssignmentShow } from "./AssignmentShow";
import { useApp } from "@/contexts/AppContext";
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import {
  Plus,
  Trash2,
  Edit,
  FileText,
  Clock,
  Star,
  Moon,
  Sun,
  Power,
  Filter,
  Sparkles,
  Layers3,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { AsyncSelect } from "@/components/ui/AsyncSelect";
import { Switch } from "@/components/ui/switch";
import { ExportExcelButton } from "@/components/common/ExportExcelButton";

export const AssignmentsPage: React.FC = () => {
  const { lang, user, isInstructor } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { stages } = useTeacherMeta(isInstructor ? user?.id : undefined);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    return (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const [filters, setFilters] = useState({
    search: "",
    stage_id: undefined as number | undefined,
    lessonId: null, // ✅

  });

  const { useGetAll, useBulkDelete, useToggleActive, useDelete } = useAssignments();

  const { data, isLoading, refetch } = useGetAll({
    ...filters,
    teacher_id: isInstructor ? user?.id : undefined,
    perPage: 20,
  });

  const bulkDelete = useBulkDelete();
  const toggleActive = useToggleActive();
  const deleteAssignment = useDelete();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const assignments = data?.data?.data || data?.data || [];
  const meta = data?.data?.meta || data?.meta;

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (
      confirm(
        lang === "ar"
          ? `حذف ${selectedIds.length} واجب؟`
          : `Delete ${selectedIds.length} assignment(s)?`
      )
    ) {
      await bulkDelete.mutateAsync(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: number) => {
    await toggleActive.mutateAsync(id);
    refetch();
  };

  const handleViewDetails = (assignment: any) => {
    setSelectedAssignmentId(assignment.id);
    setShowDetails(true);
  };

  const handleDeleteAssignment = async (id: number) => {
    if (confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الواجب؟" : "Delete this assignment?")) {
      await deleteAssignment.mutateAsync(id);
      setShowDetails(false);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        min-h-screen relative overflow-hidden
        transition-all duration-500
        ${isDarkMode
          ? "bg-[#050816]"
          : "bg-gradient-to-b from-[#f8fafc] to-[#eef2ff]"
        }
      `}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 overflow-hidden">
        {/* GRID */}
        <div
          className={`
            absolute inset-0 opacity-[0.05]
            bg-[radial-gradient(#ffffff_1px,transparent_1px)]
            bg-[length:26px_26px]
            ${!isDarkMode && "bg-[radial-gradient(#000000_1px,transparent_1px)] opacity-[0.03]"}
          `}
        />

        {/* ORBS */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
          }}
          className={`
            absolute top-[-250px] left-[-250px]
            w-[600px] h-[600px]
            rounded-full blur-[160px]
            ${isDarkMode
              ? "bg-orange-500/20"
              : "bg-orange-300/40"
            }
          `}
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
          }}
          className={`
            absolute bottom-[-250px] right-[-250px]
            w-[650px] h-[650px]
            rounded-full blur-[170px]
            ${isDarkMode
              ? "bg-purple-500/20"
              : "bg-indigo-300/40"
            }
          `}
        />

        {/* FLOATING SQUARES */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
            }}
            className={`
              absolute rounded-xl border
              ${isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-black/[0.03] border-black/[0.05]"
              }
            `}
            style={{
              width: `${20 + i * 5}px`,
              height: `${20 + i * 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      <div
        className="relative z-10 p-6"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10">
          <div>
            <div
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5
                ${isDarkMode
                  ? "bg-white/5 text-orange-300 border border-white/10"
                  : "bg-orange-100 text-orange-700 border border-orange-200"
                }
              `}
            >
              <Sparkles className="w-4 h-4" />
              {lang === "ar"
                ? "لوحة إدارة الواجبات"
                : "Assignments Dashboard"}
            </div>

            <h1
              className={`
                text-4xl font-black
                ${isDarkMode
                  ? "text-white"
                  : "text-gray-900"
                }
              `}
            >
              {lang === "ar"
                ? "إدارة الواجبات"
                : "Assignments"}
            </h1>

            <p
              className={`mt-2 ${isDarkMode
                ? "text-gray-400"
                : "text-gray-600"
                }`}
            >
              {lang === "ar"
                ? "تحكم كامل في الواجبات والاختبارات"
                : "Manage all assignments professionally"}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3">
            {/* ✅ زرار التصدير */}
            <ExportExcelButton
              data={assignments}
              fileName="assignments-list"
              label={lang === 'ar' ? 'تصدير' : 'Export'}
              disabled={isLoading || assignments.length === 0}
            />
            {/* FILTER */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`
                h-12 px-4 rounded-2xl
                flex items-center gap-2
                transition-all
                ${showFilters
                  ? "bg-orange-500 text-white"
                  : isDarkMode
                    ? "bg-white/5 text-white border border-white/10"
                    : "bg-white text-gray-700 border border-gray-200"
                }
              `}
            >
              <Filter size={18} />
            </motion.button>

            {/* THEME */}
            <motion.button
              whileHover={{ rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`
                h-12 w-12 rounded-2xl
                flex items-center justify-center
                ${isDarkMode
                  ? "bg-white/5 text-yellow-400 border border-white/10"
                  : "bg-white text-gray-800 border border-gray-200"
                }
              `}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* DELETE */}
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={handleDeleteSelected}
                  className="h-12 px-5 rounded-2xl bg-red-500 text-white font-bold flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  {selectedIds.length}
                </motion.button>
              )}
            </AnimatePresence>

            {/* ADD */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="
                h-12 px-6 rounded-2xl
                bg-gradient-to-r from-orange-500 to-pink-500
                text-white font-bold
                flex items-center gap-2
                shadow-[0_0_40px_rgba(255,140,0,0.3)]
              "
            >
              <Plus size={18} />
              {lang === "ar" ? "إضافة واجب" : "Add"}
            </motion.button>
          </div>
        </div>

        {/* ================= FILTERS ================= */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                mb-8 p-5 rounded-3xl
                backdrop-blur-2xl
                border
                ${isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/70 border-gray-200"
                }
              `}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={
                    lang === "ar"
                      ? "بحث..."
                      : "Search..."
                  }
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search: e.target.value,
                    })
                  }
                  className={`
                    h-12 rounded-2xl px-4 outline-none
                    ${isDarkMode
                      ? "bg-black/20 border border-white/10 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                    }
                  `}
                />

                {/* ✅ select عادي من useTeacherMeta */}
                <select
                  value={filters.stage_id || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      stage_id: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className={`h-12 rounded-2xl px-4 outline-none ${isDarkMode
                    ? 'bg-black/20 border border-white/10 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                >
                  <option value="">
                    {lang === 'ar' ? 'كل المراحل' : 'All Stages'}
                  </option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>




                {/* Lesson Filter */}
                {/* <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-sm font-medium">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {lang === 'ar' ? 'الدرس' : 'Lesson'}
                  </Label>
                  <AsyncSelect
                    key={`filter-lesson-${filters.stageId}`}
                    configKey="lessons"
                    value={filters.lessonId}
                    onChange={(id) => setFilters(prev => ({ ...prev, lessonId: id }))}
                    placeholder={lang === 'ar' ? 'كل الدروس' : 'All Lessons'}
                    clearable
                    extraFilters={filters.stageId ? { stage_id: filters.stageId } : {}}
                  />
                </div> */}

              </div>
            </motion.div>
          )}






        </AnimatePresence>

        {/* ================= SHOW DETAILS OR CARDS ================= */}
        {showDetails && selectedAssignmentId ? (
          <AssignmentShow
            assignmentId={selectedAssignmentId}
            onBack={() => setShowDetails(false)}
            onEdit={() => {
              const assignmentToEdit = assignments.find((a: any) => a.id === selectedAssignmentId);
              setEditingItem(assignmentToEdit);
              setIsModalOpen(true);
              setShowDetails(false);
            }}
            onDelete={() => handleDeleteAssignment(selectedAssignmentId)}
            isDarkMode={isDarkMode}
          />
        ) : (
          <>
            {/* ================= CARDS ================= */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
              <AnimatePresence>
                {assignments.map((assignment: any, index: number) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -10 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                    }}
                    className={`
                      group relative overflow-hidden rounded-[30px]
                      border backdrop-blur-2xl
                      transition-all duration-500
                      cursor-pointer
                      ${isDarkMode
                        ? "bg-white/5 border-white/10 hover:border-orange-500/30"
                        : "bg-white/80 border-gray-200 hover:border-orange-300"
                      }
                    `}
                    onClick={() => handleViewDetails(assignment)}
                  >
                    {/* glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />

                    {/* TOP */}
                    <div className="relative p-6 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div
                          className="
                            w-16 h-16 rounded-2xl
                            bg-gradient-to-br from-orange-500 to-pink-500
                            flex items-center justify-center
                            shadow-lg
                          "
                        >
                          <FileText className="w-8 h-8 text-white" />
                        </div>

                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(assignment);
                            }}
                            className={`
                              w-10 h-10 rounded-xl flex items-center justify-center
                              ${isDarkMode
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }
                            `}
                          >
                            <Eye size={16} />
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(assignment.id);
                            }}
                            className={`
                              w-10 h-10 rounded-xl flex items-center justify-center
                              ${assignment.active
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white"
                              }
                            `}
                          >
                            <Power size={16} />
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(assignment);
                            }}
                            className={`
                              w-10 h-10 rounded-xl flex items-center justify-center
                              ${isDarkMode
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }
                            `}
                          >
                            <Edit size={16} />
                          </motion.button>
                        </div>
                      </div>

                      <h3
                        className={`
                          mt-5 text-2xl font-bold line-clamp-1
                          ${isDarkMode ? "text-white" : "text-gray-900"}
                        `}
                      >
                        {isDarkMode ? assignment.title : assignment.title}
                      </h3>

                      <p
                        className={`
                          mt-2 line-clamp-2 text-sm
                          ${isDarkMode ? "text-gray-400" : "text-gray-600"}
                        `}
                      >
                        {assignment.description}
                      </p>
                    </div>

                    {/* BODY */}
                    <div className="p-6 space-y-4">
                      <InfoRow
                        icon={<Star size={16} />}
                        label={lang === "ar" ? "الدرجة" : "Marks"}
                        value={assignment.total_marks}
                        isDarkMode={isDarkMode}
                      />

                      <InfoRow
                        icon={<Clock size={16} />}
                        label={lang === "ar" ? "المدة" : "Duration"}
                        value={`${assignment.duration_minutes} min`}
                        isDarkMode={isDarkMode}
                      />

                      <InfoRow
                        icon={<Layers3 size={16} />}
                        label={lang === "ar" ? "الحالة" : "Status"}
                        value={
                          assignment.active
                            ? lang === "ar"
                              ? "نشط"
                              : "Active"
                            : lang === "ar"
                              ? "غير نشط"
                              : "Inactive"
                        }
                        isDarkMode={isDarkMode}
                      />

                      <div
                        className={`
                          pt-4 border-t text-xs
                          ${isDarkMode ? "border-white/10 text-gray-500" : "border-gray-200 text-gray-500"}
                        `}
                      >
                        {format(
                          new Date(assignment.created_at),
                          "dd/MM/yyyy",
                          {
                            locale: lang === "ar" ? arSA : enUS,
                          }
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ================= EMPTY ================= */}
            {!assignments.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32"
              >
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  <FileText
                    className={`
                      w-24 h-24 mx-auto mb-5
                      ${isDarkMode ? "text-white/20" : "text-gray-300"}
                    `}
                  />
                </motion.div>

                <h3
                  className={`
                    text-2xl font-bold
                    ${isDarkMode ? "text-white" : "text-gray-900"}
                  `}
                >
                  {lang === "ar"
                    ? "لا توجد واجبات"
                    : "No Assignments"}
                </h3>
              </motion.div>
            )}
          </>
        )}

        {/* ================= MODAL ================= */}
        <AssignmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            refetch();
            setShowDetails(false);
          }}
          editingItem={editingItem}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

/* ================= INFO ROW ================= */
const InfoRow = ({ icon, label, value, isDarkMode }: any) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className={`
        flex items-center justify-between
        p-4 rounded-2xl
        ${isDarkMode ? "bg-white/[0.03]" : "bg-gray-50"}
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-9 h-9 rounded-xl
            flex items-center justify-center
            ${isDarkMode
              ? "bg-white/10 text-orange-300"
              : "bg-orange-100 text-orange-600"
            }
          `}
        >
          {icon}
        </div>
        <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
          {label}
        </span>
      </div>
      <span className={isDarkMode ? "text-white font-bold" : "text-gray-900 font-bold"}>
        {value}
      </span>
    </motion.div>
  );
};  