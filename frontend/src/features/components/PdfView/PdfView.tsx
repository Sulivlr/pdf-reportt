import React, { useCallback, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axiosApi from '@/axiosApi';
import type { FileEntity } from '@/types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileEntity | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ isOpen, onClose, file }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const fetchPdfBlob = useCallback(async (fileId: string | undefined) => {
    if (!fileId) {
      setPdfBlob(null);
      return;
    }

    try {
      const res = await axiosApi.get(`/files/${fileId}/download`, { responseType: 'blob' });
      setPdfBlob(res.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    void fetchPdfBlob(file?.id?.toString());
  }, [file?.id, fetchPdfBlob]);


  const createPdfUrl = useCallback(() => {
    if (!pdfBlob) {
      setPdfUrl(null);
      return;
    }
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPdfUrl(null);
    };
  }, [pdfBlob]);

  useEffect(() => {
    return createPdfUrl();
  }, [createPdfUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: '700px', width: '100%' }}>
      <DialogHeader>
          <DialogTitle>{file?.name}</DialogTitle>
        </DialogHeader>
        {pdfUrl && (
          <>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-h-[70vh] overflow-auto"
            >
              <Page pageNumber={pageNumber} />
            </Document>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Страница {pageNumber} из {numPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
