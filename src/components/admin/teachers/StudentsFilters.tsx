/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/dashboard/StudentsFilters.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, X, Phone, Award, GraduationCap, Monitor, 
  CheckCircle, Clock, Building2 
} from 'lucide-react';

interface StudentsFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterStageId: number | null;
  setFilterStageId: (id: number | null) => void;
  filterAttendance: string;
  setFilterAttendance: (type: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterTypeOfStudy: string;
  setFilterTypeOfStudy: (type: string) => void;
  filterPhone: string;
  setFilterPhone: (phone: string) => void;
  filterCodeParent: string;
  setFilterCodeParent: (code: string) => void;
  filterCenterHourId: string;
  setFilterCenterHourId: (id: string) => void;
  stages: any[];
  allCenterHours: any[];
  loadingCenterHours: boolean;
  clearFilters: () => void;
  getCenterHourDisplay: (hour: any) => string;
  hasActiveFilters: boolean;
}

export const StudentsFilters: React.FC<StudentsFiltersProps> = ({
  showFilters,
  setShowFilters,
  filterStageId,
  setFilterStageId,
  filterAttendance,
  setFilterAttendance,
  filterStatus,
  setFilterStatus,
  filterTypeOfStudy,
  setFilterTypeOfStudy,
  filterPhone,
  setFilterPhone,
  filterCodeParent,
  setFilterCodeParent,
  filterCenterHourId,
  setFilterCenterHourId,
  stages,
  allCenterHours,
  loadingCenterHours,
  clearFilters,
  getCenterHourDisplay,
  hasActiveFilters,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-red-500"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Stage Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-sm font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Stage
                  </Label>
                  <select
                    value={filterStageId || ''}
                    onChange={(e) => setFilterStageId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">All Stages</option>
                    {stages.map((stage: any) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Study Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Study Type
                  </Label>
                  <select
                    value={filterTypeOfStudy}
                    onChange={(e) => setFilterTypeOfStudy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">All</option>
                    <option value="general">📚 General</option>
                    <option value="azhar">🕌 Azhar</option>
                  </select>
                </div>

                {/* Attendance Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Monitor className="h-4 w-4" />
                    Attendance Type
                  </Label>
                  <select
                    value={filterAttendance}
                    onChange={(e) => {
                      setFilterAttendance(e.target.value);
                      if (e.target.value !== 'center') setFilterCenterHourId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">All</option>
                    <option value="online">🖥️ Online</option>
                    <option value="center">🏢 Center</option>
                  </select>
                </div>

                {/* Center Hour */}
                {filterAttendance === 'center' && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      Center Hour
                    </Label>
                    <select
                      value={filterCenterHourId}
                      onChange={(e) => setFilterCenterHourId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                      disabled={loadingCenterHours}
                    >
                      <option value="">All Center Hours</option>
                      {allCenterHours.map((hour) => (
                        <option key={hour.id} value={String(hour.id)}>
                          {getCenterHourDisplay(hour)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Status
                  </Label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">All</option>
                    <option value="active">✅ Active</option>
                    <option value="inactive">❌ Inactive</option>
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input
                    value={filterPhone}
                    onChange={(e) => setFilterPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="rounded-xl"
                  />
                </div>

                {/* Parent Code */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Parent Code
                  </Label>
                  <Input
                    value={filterCodeParent}
                    onChange={(e) => setFilterCodeParent(e.target.value)}
                    placeholder="Enter parent code"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Active Filters:</span>
                  {filterStageId && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {stages.find(s => s.id === filterStageId)?.name || filterStageId}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStageId(null)} />
                    </Badge>
                  )}
                  {filterTypeOfStudy && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {filterTypeOfStudy === 'general' ? '📚 General' : '🕌 Azhar'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterTypeOfStudy('')} />
                    </Badge>
                  )}
                  {filterAttendance && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {filterAttendance === 'online' ? '🖥️ Online' : '🏢 Center'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterAttendance('')} />
                    </Badge>
                  )}
                  {filterCenterHourId && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock className="h-3 w-3" />
                      {allCenterHours.find(h => h.id === Number(filterCenterHourId))?.title}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCenterHourId('')} />
                    </Badge>
                  )}
                  {filterStatus && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {filterStatus === 'active' ? '✅ Active' : '❌ Inactive'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus('')} />
                    </Badge>
                  )}
                  {filterPhone && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      📞 {filterPhone}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterPhone('')} />
                    </Badge>
                  )}
                  {filterCodeParent && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      🎫 {filterCodeParent}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCodeParent('')} />
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Reset All
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};