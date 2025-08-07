import React, { useEffect, useState } from 'react';
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

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    blob?: Blob;
    url?: string;
  } | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ isOpen, onClose, file }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdf, setPdf] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };



  useEffect(() => {
    const fetch = axiosApi.get('files/83/download', {responseType: 'blob' as const});
    fetch.then((res) => {
      console.log(res.data);
      setPdf(res.data);
    });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{file?.name}</DialogTitle>
        </DialogHeader>
        {pdf && (
          <>
            <Document
              file={pdf}
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
