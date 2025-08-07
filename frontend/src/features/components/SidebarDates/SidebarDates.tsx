import React, { useState } from 'react';
import PDFViewer from '../PdfView/PdfView';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectFiles } from '@/features/components/FileView/filesSlice';
import { fetchFiles } from '@/features/components/FileView/filesThunks';
import getFileBadge from '@/components/fileIcons/FileIcons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import axiosApi from '@/axiosApi';
import type { FileEntity } from '@/types';

const SidebarDates = () => {
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectFiles);
  const [selectedFile, setSelectedFile] = useState<FileEntity | null>(null);

  React.useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const groupedFiles = files.reduce<Record<string, FileEntity[]>>(
    (acc, file) => {
      const date = formatDate(file.uploadedAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(file);
      return acc;
    },
    {},
  );

  const downloadFile = async (file: FileEntity) => {
    try {
      const response = await axiosApi.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  const handleFileClick = (file: FileEntity) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      setSelectedFile(file);
    } else {
      void downloadFile(file);
    }
  };

  return (
    <>
      <div className="w-64 p-2 space-y-3">
        {Object.entries(groupedFiles).map(([date, files]) => (
          <div key={date} className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground px-2">
              {date}
            </h3>
            <div className="space-y-1">
              {files.map((file) => (
                <Card
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="hover:bg-accent/50 transition-colors border-0 shadow-none cursor-pointer"
                >
                  <CardContent className="p-2 flex items-center gap-2">
                    <Badge
                      className={cn(
                        'w-6 h-6 rounded-full',
                        'flex items-center justify-center',
                        'bg-primary/80',
                        'text-xs font-medium',
                      )}
                    >
                      {getFileBadge(file.name)}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {file.name}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <PDFViewer
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
      />
    </>
  );
};

export default SidebarDates;
