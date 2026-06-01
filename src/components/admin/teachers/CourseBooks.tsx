// src/components/admin/teachers/course/CourseBooks.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Heart,
  Share2,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Book {
  id: number;
  title: string;
  writer: string;
  price: string;
  pagesCount: number;
  imageUrl: string;
  active: boolean;
  createdAt: string;
  description?: string;
}

interface CourseBooksProps {
  books: Book[];
}

export function CourseBooks({ books }: CourseBooksProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Resources</h2>
          <p className="text-muted-foreground">{books.length} books and materials available</p>
        </div>
        <Button className="gap-2">
          <BookOpen className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Books Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => (
          <Card 
            key={book.id} 
            className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
              {book.imageUrl ? (
                <img 
                  src={book.imageUrl} 
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute top-3 right-3">
                <Badge variant={book.active ? 'default' : 'secondary'}>
                  {book.active ? 'Available' : 'Draft'}
                </Badge>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-semibold truncate">{book.title}</p>
                <p className="text-white/80 text-sm">By {book.writer}</p>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Pages</p>
                  <p className="font-semibold">{book.pagesCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold text-green-600">${book.price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(book.createdAt).toLocaleDateString()}
                </span>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedBook(book)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No books or resources added yet</p>
          <Button variant="link" className="mt-2">Add your first resource</Button>
        </div>
      )}

      {/* Book Details Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32 h-40 rounded-lg overflow-hidden bg-muted">
                  {selectedBook.imageUrl ? (
                    <img src={selectedBook.imageUrl} alt={selectedBook.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">By {selectedBook.writer}</p>
                  <div className="flex gap-3 mt-2">
                    <Badge>PDF</Badge>
                    <Badge variant="outline">{selectedBook.pagesCount} pages</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-3">${selectedBook.price}</p>
                </div>
              </div>
              
              {selectedBook.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedBook.description}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}