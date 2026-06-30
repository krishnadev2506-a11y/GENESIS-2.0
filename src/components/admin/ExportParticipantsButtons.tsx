'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type ExportFormat = 'csv' | 'xlsx';

function downloadParticipants(format: ExportFormat) {
  window.location.href = `/api/admin/export/participants?format=${format}`;
}

export function ExportParticipantsButtons() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="secondary"
        size="sm"
        className="gap-2"
        onClick={() => downloadParticipants('csv')}
      >
        <Download size={16} />
        Download CSV
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => downloadParticipants('xlsx')}
      >
        <Download size={16} />
        Download Excel
      </Button>
    </div>
  );
}
