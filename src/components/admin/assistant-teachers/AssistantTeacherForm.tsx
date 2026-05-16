/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/assistant-teachers/AssistantTeacherForm.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { assistantTeacherService } from '@/services/assistant-teacher.service';
import type { AssistantTeacherFormData } from '@/types/assistant-teacher.types';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssistantTeacherFormData) => Promise<void>;
  assistantId?: number | null;
  loading?: boolean;
}

export function AssistantTeacherForm({ open, onClose, onSubmit, assistantId, loading }: Props) {
  const { t, dir } = useApp();
  
  const [formData, setFormData] = useState<AssistantTeacherFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    teacher_id: 0,
  });
  
  const [fetchingAssistant, setFetchingAssistant] = useState(false);

  useEffect(() => {
    const fetchAssistantData = async () => {
      if (!open) return;
      
      if (assistantId) {
        setFetchingAssistant(true);
        try {
          const assistant = await assistantTeacherService.getAssistantTeacher(assistantId);
          setFormData({
            name: assistant.name,
            email: assistant.email,
            phone: assistant.phone,
            password: '',
            teacher_id: assistant.teacher_id,
          });
        } catch (error) {
          console.error('Failed to fetch assistant:', error);
        } finally {
          setFetchingAssistant(false);
        }
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          teacher_id: 0,
        });
      }
    };

    fetchAssistantData();
  }, [assistantId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    if (!assistantId) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        teacher_id: 0,
      });
    }
    onClose();
  };

  if (fetchingAssistant) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading assistant data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {assistantId ? 'Edit Assistant Teacher' : 'Add Assistant Teacher'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label>Password {assistantId && '(leave empty to keep)'}</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required={!assistantId}
            />
          </div>

          {/* 🔥 Main Teacher Select with AsyncSelect */}
          <div>
            <Label>Main Teacher</Label>
            <AsyncSelect
              configKey="teachers"
              value={formData.teacher_id}
              onChange={(value) => setFormData(prev => ({ ...prev, teacher_id: value || 0 }))}
              placeholder="Select teacher"
              searchPlaceholder="Search teacher by name or email..."
              required
              perPageOptions={[10, 25, 50, 100]}
              defaultPerPage={25}
              showPagination
                debounceDelay={500}        
  cacheData={true}          
  enableInfiniteScroll={false}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (assistantId ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}