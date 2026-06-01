/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/StudentsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { StatusBadge } from "@/components/lms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Loader2, Search, Download, Mail, Phone, X } from "lucide-react";
import { useState, useMemo } from "react";

interface StudentsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    subtitle?: string;
    students: any[];
    loading: boolean;
    type: 'semester' | 'course' | 'lesson';
}

export function StudentsModal({ open, onOpenChange, title, subtitle, students, loading, type }: StudentsModalProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) return students;
        return students.filter((student) =>
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    const getTypeIcon = () => {
        switch (type) {
            case 'semester': return '📚';
            case 'course': return '📖';
            case 'lesson': return '📝';
            default: return '👨‍🎓';
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Balance'];
        const csvData = filteredStudents.map(student => [
            student.name,
            student.email || '',
            student.phone || '',
            student.active ? 'Active' : 'Inactive',
            student.balance || '0'
        ]);
        
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s/g, '_')}_students.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                {getTypeIcon()}
                            </div>
                            <div>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {title}
                                </DialogTitle>
                                {subtitle && (
                                    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                                )}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6 pt-3 flex-1 overflow-hidden flex flex-col">
                    {/* Search and Actions */}
                    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                            <Download className="h-4 w-4" />
                            Export List
                        </Button>
                    </div>

                    {/* Students List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredStudents && filteredStudents.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto pr-2">
                            {filteredStudents.map((student: any, idx: number) => (
                                <div 
                                    key={student.id} 
                                    className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-md transition-all group"
                                >
                                    <AvatarBadge initials={student.name?.charAt(0) || student.avatar || 'S'} size="lg" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{student.name || 'Unknown'}</p>
                                        {student.email && (
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                                                <Mail className="h-3 w-3" />
                                                {student.email}
                                            </p>
                                        )}
                                        {student.phone && (
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {student.phone}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <StatusBadge status={student.active ? 'active' : 'inactive'} />
                                            {student.attended && type === 'lesson' && (
                                                <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                                                    ✓ Attended
                                                </span>
                                            )}
                                            {student.balance !== undefined && (
                                                <span className={`text-xs font-medium ${Number(student.balance) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    ${student.balance}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No students found</p>
                            {searchTerm && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Try adjusting your search
                                </p>
                            )}
                        </div>
                    )}

                    {/* Footer Stats */}
                    <div className="mt-4 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredStudents.length} of {students.length} students
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}