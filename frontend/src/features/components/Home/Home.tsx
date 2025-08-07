import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Home: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4">
      <Card className="w-full max-w-xl shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardContent className="py-12 px-8 text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">
            Платформа для просмотра PDF-отчётов
          </h1>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
