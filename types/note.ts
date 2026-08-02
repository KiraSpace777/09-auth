// Обмеження для вибору тегів
export type NoteTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

// Інтерфейс нотатки
export interface Note {
  id: string;
  title: string;
  content: string;
  tag: NoteTag;
  createdAt: string;
  updatedAt: string;
}

// Типізація даних для створення нової нотатки
export interface CreateNoteData {
  title: string;
  content: string;
  tag: NoteTag;   
}
