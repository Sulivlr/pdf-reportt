import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchFiles } from '@/features/components/FileView/filesThunks';
import { selectFiles } from '@/features/components/FileView/filesSlice';
import type { FileEntity } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import PDFViewer from '../PdfView/PdfView';
import axiosApi from '@/axiosApi';
import { toast } from 'react-toastify';

const DatesView = () => {
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectFiles);

  const [selectedFile, setSelectedFile] = useState<
    (FileEntity & { path: string }) | null
  >(null);

  const handleFileClick = useCallback(async (file: FileEntity) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      setSelectedFile({
        ...file,
        path: `/files/${file.id}/download`,
      });
    } else {
      try {
        const res = await axiosApi.get(`/files/${file.id}/download`, {
          responseType: 'blob',
        });
        const blob = new Blob([res.data]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        toast.error('Ошибка при скачивании файла');
      }
    }
  }, []);

  const clearSelectedFile = useCallback(() => setSelectedFile(null), []);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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

  return (
    <div className="flex flex-col bg-background p-4">
      <Card className="w-full max-w-4xl mx-auto mt-10 shadow-2xl bg-background">
        <CardHeader
          className="border-b sticky top-0 bg-background z-10"
          style={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Просмотр по датам
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {Object.entries(groupedFiles).map(([date, files]) => (
                <div key={date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{date}</h3>
                    <Badge variant="outline">{files.length} файла</Badge>
                  </div>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleFileClick(file)}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer"
                      >
                        <FileText className="text-muted-foreground" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Создан:{' '}
                            {new Date(file.uploadedAt).toLocaleTimeString(
                              'ru-RU',
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedFile && (
        <PDFViewer
          isOpen={!!selectedFile}
          onClose={clearSelectedFile}
          file={selectedFile}
        />
      )}
    </div>
  );
};

export default DatesView;
